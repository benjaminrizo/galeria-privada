package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

const galeriaValida = "3f2504e0-4f89-41d3-9a0c-0305e82c3301"

// La validación es la regla de negocio que más barato se rompe al portar el
// servicio de NestJS a Go, así que se cubre entrada por entrada.
func TestValidarPeticionCrear(t *testing.T) {
	casos := []struct {
		nombre  string
		cuerpo  string
		valido  bool
		mensaje string
	}{
		{"datos correctos", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":5,"precioUnitario":15000}`, true, ""},
		{"precio con dos decimales", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":1,"precioUnitario":99.99}`, true, ""},
		{"galeria que no es UUID", `{"galeriaId":"abc","cantidadFotos":5,"precioUnitario":100}`, false, "UUID"},
		{"cantidad cero", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":0,"precioUnitario":100}`, false, "mayor que cero"},
		{"cantidad negativa", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":-3,"precioUnitario":100}`, false, "mayor que cero"},
		{"cantidad decimal", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":2.5,"precioUnitario":100}`, false, "entero"},
		{"precio cero", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":2,"precioUnitario":0}`, false, "mayor que cero"},
		{"precio con tres decimales", `{"galeriaId":"` + galeriaValida + `","cantidadFotos":2,"precioUnitario":10.005}`, false, "dos decimales"},
	}

	for _, c := range casos {
		t.Run(c.nombre, func(t *testing.T) {
			var p peticionCrear
			if err := json.NewDecoder(strings.NewReader(c.cuerpo)).Decode(&p); err != nil {
				t.Fatalf("el JSON de prueba no se pudo leer: %v", err)
			}

			_, _, _, err := p.validar()
			if c.valido && err != nil {
				t.Fatalf("se esperaba válido, pero falló: %v", err)
			}
			if !c.valido {
				if err == nil {
					t.Fatal("se esperaba un error de validación y no hubo ninguno")
				}
				if !strings.Contains(err.Error(), c.mensaje) {
					t.Errorf("el mensaje no menciona «%s»: %v", c.mensaje, err)
				}
			}
		})
	}
}

// El total lo calcula el servicio, nunca llega de fuera: si este redondeo
// cambia, se cobra de más o de menos.
func TestTotalSeRedondeaADosDecimales(t *testing.T) {
	casos := []struct {
		cantidad int
		precio   float64
		esperado float64
	}{
		{5, 15000, 75000},
		{3, 33.33, 99.99},
		{7, 0.1, 0.7},
		{1, 99.99, 99.99},
	}

	for _, c := range casos {
		if obtenido := aDosDecimales(float64(c.cantidad) * c.precio); obtenido != c.esperado {
			t.Errorf("%d x %.2f = %v, se esperaba %v", c.cantidad, c.precio, obtenido, c.esperado)
		}
	}
}

func TestNuevoUUIDTieneElFormatoEsperado(t *testing.T) {
	vistos := make(map[string]bool)
	for i := 0; i < 500; i++ {
		id := nuevoUUID()
		if !patronUUID.MatchString(id) {
			t.Fatalf("no es un UUID versión 4: %s", id)
		}
		if vistos[id] {
			t.Fatalf("identificador repetido: %s", id)
		}
		vistos[id] = true
	}
}

// Liveness y readiness son distintos: el proceso puede estar vivo sin estar
// listo. Es justo la diferencia que piden /ping y /health.
func TestPingRespondeAunqueNoHayaBaseDeDatos(t *testing.T) {
	api := &API{almacen: &Almacen{}} // sin conexión a MongoDB

	grabadora := httptest.NewRecorder()
	rutas(api).ServeHTTP(grabadora, httptest.NewRequest(http.MethodGet, "/ping", nil))

	if grabadora.Code != http.StatusOK {
		t.Errorf("/ping devolvió %d, se esperaba 200", grabadora.Code)
	}
}

func TestHealthFallaSiNoHayBaseDeDatos(t *testing.T) {
	api := &API{almacen: &Almacen{}}

	grabadora := httptest.NewRecorder()
	rutas(api).ServeHTTP(grabadora, httptest.NewRequest(http.MethodGet, "/health", nil))

	if grabadora.Code != http.StatusServiceUnavailable {
		t.Errorf("/health devolvió %d, se esperaba 503", grabadora.Code)
	}
}

func TestIdentificadorMalFormadoDevuelve404(t *testing.T) {
	api := &API{almacen: &Almacen{}}

	grabadora := httptest.NewRecorder()
	rutas(api).ServeHTTP(grabadora, httptest.NewRequest(http.MethodGet, "/pedidos/no-es-un-uuid", nil))

	if grabadora.Code != http.StatusNotFound {
		t.Errorf("devolvió %d, se esperaba 404", grabadora.Code)
	}

	var err ErrorDeNegocio
	_ = json.NewDecoder(grabadora.Body).Decode(&err)
	if err.Codigo != "PEDIDO_NO_ENCONTRADO" {
		t.Errorf("código «%s», se esperaba PEDIDO_NO_ENCONTRADO", err.Codigo)
	}
}
