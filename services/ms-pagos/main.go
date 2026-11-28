// ms-pagos · Galería Privada
//
// Microservicio de pagos: pedidos de fotos extra con pago simulado (HU-19, HU-20).
// Escrito en Go con MongoDB, frente al resto del sistema que usa NestJS y
// PostgreSQL. Es la heterogeneidad que pide el capítulo 8 (Guideline 3):
// distinto lenguaje y distinta base de datos para un servicio con otras
// características de carga y un ciclo de vida independiente.
//
// Contrato: docs/QueriesYActions/ms-pagos.md
package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ---------------------------------------------------------------- el agregado

// EstadoPendiente y EstadoConfirmado son los dos únicos estados de un pedido.
const (
	EstadoPendiente  = "pendiente"
	EstadoConfirmado = "confirmado"
)

// Pedido es el agregado AG-06 (docs/EventStorming/03-agregados.md).
//
// No hay ningún campo de tarjeta ni de medio de pago: el pago es simulado y el
// sistema nunca guarda esos datos (RNF-06).
type Pedido struct {
	ID             string     `bson:"_id"            json:"pedidoId"`
	GaleriaID      string     `bson:"galeriaId"      json:"galeriaId"` // referencia lógica a ms-galerias
	CantidadFotos  int        `bson:"cantidadFotos"  json:"cantidadFotos"`
	PrecioUnitario float64    `bson:"precioUnitario" json:"precioUnitario"`
	Total          float64    `bson:"total"          json:"total"`
	Estado         string     `bson:"estado"         json:"estado"`
	CreadoEn       time.Time  `bson:"creadoEn"       json:"creadoEn"`
	ConfirmadoEn   *time.Time `bson:"confirmadoEn"   json:"confirmadoEn"`
}

// ------------------------------------------------------------------- errores

// ErrorDeNegocio viaja con el formato acordado en docs/QueriesYActions/README.md:
//
//	{ "codigo": "CODIGO_DE_ERROR", "mensaje": "texto legible" }
type ErrorDeNegocio struct {
	Estado  int    `json:"-"`
	Codigo  string `json:"codigo"`
	Mensaje string `json:"mensaje"`
}

func (e ErrorDeNegocio) Error() string { return e.Codigo + ": " + e.Mensaje }

func datosInvalidos(mensaje string) ErrorDeNegocio {
	return ErrorDeNegocio{http.StatusUnprocessableEntity, "DATOS_INVALIDOS", mensaje}
}

func noEncontrado() ErrorDeNegocio {
	return ErrorDeNegocio{http.StatusNotFound, "PEDIDO_NO_ENCONTRADO", "No existe ese pedido."}
}

// --------------------------------------------------------------- utilidades

var patronUUID = regexp.MustCompile(
	`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`)

// nuevoUUID genera un identificador versión 4 sin depender de ninguna librería.
func nuevoUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	b[6] = (b[6] & 0x0f) | 0x40 // versión 4
	b[8] = (b[8] & 0x3f) | 0x80 // variante RFC 4122
	h := hex.EncodeToString(b)
	return strings.Join([]string{h[0:8], h[8:12], h[12:16], h[16:20], h[20:32]}, "-")
}

// aDosDecimales redondea igual que el toFixed(2) que usaba la versión anterior.
func aDosDecimales(v float64) float64 { return math.Round(v*100) / 100 }

func entorno(clave, porDefecto string) string {
	if v := os.Getenv(clave); v != "" {
		return v
	}
	return porDefecto
}

func responder(w http.ResponseWriter, estado int, cuerpo any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(estado)
	_ = json.NewEncoder(w).Encode(cuerpo)
}

func responderError(w http.ResponseWriter, err error) {
	var negocio ErrorDeNegocio
	if errors.As(err, &negocio) {
		responder(w, negocio.Estado, negocio)
		return
	}
	log.Printf("error inesperado: %v", err)
	responder(w, http.StatusInternalServerError, ErrorDeNegocio{
		Codigo: "ERROR_INTERNO", Mensaje: "No se pudo completar la operación.",
	})
}

// ------------------------------------------------------------ almacenamiento

// Almacen guarda los pedidos. La conexión se establece en segundo plano para
// que el servicio responda a /ping aunque MongoDB todavía no esté listo.
type Almacen struct {
	mu        sync.RWMutex
	coleccion *mongo.Collection
	cliente   *mongo.Client
}

func (a *Almacen) conectar(uri, baseDeDatos string) {
	for intento := 1; ; intento++ {
		ctx, cancelar := context.WithTimeout(context.Background(), 10*time.Second)
		cliente, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err == nil {
			err = cliente.Ping(ctx, nil)
		}
		cancelar()

		if err == nil {
			a.mu.Lock()
			a.cliente = cliente
			a.coleccion = cliente.Database(baseDeDatos).Collection("pedidos")
			a.mu.Unlock()
			log.Printf("conectado a MongoDB (base «%s»)", baseDeDatos)
			return
		}

		log.Printf("MongoDB no responde todavía (intento %d): %v", intento, err)
		time.Sleep(3 * time.Second)
	}
}

func (a *Almacen) listo() bool {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.coleccion != nil
}

func (a *Almacen) col() (*mongo.Collection, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	if a.coleccion == nil {
		return nil, ErrorDeNegocio{http.StatusServiceUnavailable, "ALMACEN_NO_DISPONIBLE",
			"La base de datos todavía no está disponible."}
	}
	return a.coleccion, nil
}

func (a *Almacen) guardar(ctx context.Context, p Pedido) error {
	col, err := a.col()
	if err != nil {
		return err
	}
	_, err = col.InsertOne(ctx, p)
	return err
}

func (a *Almacen) buscar(ctx context.Context, id string) (Pedido, error) {
	var p Pedido
	col, err := a.col()
	if err != nil {
		return p, err
	}
	err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&p)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return p, noEncontrado()
	}
	return p, err
}

func (a *Almacen) confirmar(ctx context.Context, id string, cuando time.Time) error {
	col, err := a.col()
	if err != nil {
		return err
	}
	// La condición sobre el estado hace la operación idempotente: si ya estaba
	// confirmado no se toca, y la fecha original se conserva.
	_, err = col.UpdateOne(ctx,
		bson.M{"_id": id, "estado": EstadoPendiente},
		bson.M{"$set": bson.M{"estado": EstadoConfirmado, "confirmadoEn": cuando}})
	return err
}

// ------------------------------------------------------------------- handlers

type API struct{ almacen *Almacen }

type peticionCrear struct {
	GaleriaID      string      `json:"galeriaId"`
	CantidadFotos  json.Number `json:"cantidadFotos"`
	PrecioUnitario json.Number `json:"precioUnitario"`
}

// validar aplica las mismas reglas que tenía la versión en NestJS.
func (p peticionCrear) validar() (string, int, float64, error) {
	if !patronUUID.MatchString(p.GaleriaID) {
		return "", 0, 0, datosInvalidos("galeriaId debe ser un UUID válido.")
	}

	cantidad, err := p.CantidadFotos.Int64()
	if err != nil {
		return "", 0, 0, datosInvalidos("La cantidad debe ser un número entero.")
	}
	if cantidad <= 0 {
		return "", 0, 0, datosInvalidos("La cantidad debe ser mayor que cero.")
	}

	precio, err := p.PrecioUnitario.Float64()
	if err != nil {
		return "", 0, 0, datosInvalidos("El precio debe ser un número.")
	}
	if precio <= 0 {
		return "", 0, 0, datosInvalidos("El precio debe ser mayor que cero.")
	}
	if aDosDecimales(precio) != precio {
		return "", 0, 0, datosInvalidos("El precio admite como máximo dos decimales.")
	}

	return p.GaleriaID, int(cantidad), precio, nil
}

// A-PAG-01 · CrearPedido (HU-20)
func (api *API) crear(w http.ResponseWriter, r *http.Request) {
	var datos peticionCrear
	if err := json.NewDecoder(r.Body).Decode(&datos); err != nil {
		responderError(w, datosInvalidos("El cuerpo de la petición no es JSON válido."))
		return
	}

	galeriaID, cantidad, precio, err := datos.validar()
	if err != nil {
		responderError(w, err)
		return
	}

	// El total se calcula aquí y no se recibe de fuera, para que no llegue mal.
	pedido := Pedido{
		ID:             nuevoUUID(),
		GaleriaID:      galeriaID,
		CantidadFotos:  cantidad,
		PrecioUnitario: precio,
		Total:          aDosDecimales(float64(cantidad) * precio),
		Estado:         EstadoPendiente,
		CreadoEn:       time.Now().UTC(),
	}

	if err := api.almacen.guardar(r.Context(), pedido); err != nil {
		responderError(w, err)
		return
	}

	// EV-24: PedidoCreado
	log.Printf("Pedido creado: %s (%d foto(s), total %.2f)", pedido.ID, pedido.CantidadFotos, pedido.Total)
	responder(w, http.StatusCreated, map[string]any{
		"pedidoId": pedido.ID, "total": pedido.Total, "estado": pedido.Estado,
	})
}

// A-PAG-02 · ConfirmarPagoSimulado (HU-20) · idempotente
//
// Confirma el pedido sin cobrar nada: es el pago simulado del alcance.
// Confirmar dos veces deja exactamente el mismo resultado.
func (api *API) confirmarPago(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !patronUUID.MatchString(id) {
		responderError(w, noEncontrado())
		return
	}

	if _, err := api.almacen.buscar(r.Context(), id); err != nil {
		responderError(w, err)
		return
	}
	if err := api.almacen.confirmar(r.Context(), id, time.Now().UTC()); err != nil {
		responderError(w, err)
		return
	}

	pedido, err := api.almacen.buscar(r.Context(), id)
	if err != nil {
		responderError(w, err)
		return
	}

	// EV-25: PagoSimuladoConfirmado
	log.Printf("Pago simulado confirmado para el pedido %s", pedido.ID)
	responder(w, http.StatusOK, pedido)
}

// Q-PAG-01 · ObtenerPedido (HU-20)
func (api *API) obtener(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !patronUUID.MatchString(id) {
		responderError(w, noEncontrado())
		return
	}

	pedido, err := api.almacen.buscar(r.Context(), id)
	if err != nil {
		responderError(w, err)
		return
	}
	responder(w, http.StatusOK, pedido)
}

// ping es el liveness probe: responde siempre que el proceso esté vivo.
func (api *API) ping(w http.ResponseWriter, _ *http.Request) {
	responder(w, http.StatusOK, map[string]string{"estado": "vivo", "servicio": "ms-pagos"})
}

// health es el readiness probe: solo responde 200 si además hay base de datos.
func (api *API) health(w http.ResponseWriter, _ *http.Request) {
	if !api.almacen.listo() {
		responder(w, http.StatusServiceUnavailable, map[string]any{
			"estado": "no listo", "mongodb": "sin conexión",
		})
		return
	}
	responder(w, http.StatusOK, map[string]any{"estado": "listo", "mongodb": "conectado"})
}

// ----------------------------------------------------------------- arranque

func rutas(api *API) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /ping", api.ping)
	mux.HandleFunc("GET /health", api.health)
	mux.HandleFunc("POST /pedidos", api.crear)
	mux.HandleFunc("POST /pedidos/{id}/pago-simulado", api.confirmarPago)
	mux.HandleFunc("GET /pedidos/{id}", api.obtener)
	return mux
}

func main() {
	puerto := entorno("PORT", "3006")
	uri := entorno("MONGO_URI", "mongodb://localhost:27017")
	baseDeDatos := entorno("MONGO_DB", "pagos_db")

	almacen := &Almacen{}
	go almacen.conectar(uri, baseDeDatos) // en segundo plano: no bloquea el arranque

	servidor := &http.Server{
		Addr:              ":" + puerto,
		Handler:           rutas(&API{almacen: almacen}),
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("ms-pagos escuchando en el puerto %s", puerto)
	if err := servidor.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(fmt.Errorf("el servidor se detuvo: %w", err))
	}
}
