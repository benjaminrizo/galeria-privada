import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Aviso, Encabezado, EnlaceCopiable, EstadoDeGaleria } from '../componentes.jsx';

/**
 * Detalle de una sesión: subir fotos (HU-07), publicar (HU-06), editar y
 * eliminar (HU-05) y definir el precio de las fotos extra (HU-19).
 */
export default function Galeria() {
  const { id } = useParams();
  const navegar = useNavigate();
  const entrada = useRef(null);

  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [edicion, setEdicion] = useState({ nombre: '', limiteIncluido: '' });
  const [precio, setPrecio] = useState('');

  async function recargar() {
    try {
      const datos = await api.galeria(id);
      setDetalle(datos);
      setEdicion({ nombre: datos.galeria.nombre, limiteIncluido: datos.galeria.limiteIncluido });
      setPrecio(datos.galeria.precioFotoExtra ?? '');
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  useEffect(() => {
    recargar();
  }, [id]);

  // Mientras haya fotos en proceso, se vuelve a consultar: las miniaturas se
  // generan en segundo plano (HU-08, RNF-08).
  useEffect(() => {
    const enProceso = detalle?.fotos?.some((f) => f.estado === 'pendiente' || f.estado === 'procesando');
    if (!enProceso) return;

    const reloj = setTimeout(recargar, 2500);
    return () => clearTimeout(reloj);
  }, [detalle]);

  async function hacer(accion, textoDeExito) {
    setOcupado(true);
    setError('');
    setMensaje('');

    try {
      await accion();
      if (textoDeExito) setMensaje(textoDeExito);
      await recargar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function subir(evento) {
    const archivos = Array.from(evento.target.files || []);
    if (!archivos.length) return;

    await hacer(
      () => api.subirFotos(id, archivos),
      `${archivos.length} foto(s) recibidas. Las miniaturas se están generando.`,
    );
    if (entrada.current) entrada.current.value = '';
  }

  async function eliminar() {
    if (!window.confirm('Se eliminará la sesión con sus fotos y su selección. ¿Continuar?')) return;

    setOcupado(true);
    try {
      await api.eliminarGaleria(id);
      navegar('/', { replace: true });
    } catch (fallo) {
      setError(fallo.message);
      setOcupado(false);
    }
  }

  if (!detalle) {
    return (
      <>
        <Encabezado titulo="Sesión" volverA="/" />
        <main className="contenido">
          <Aviso error={error} />
          {!error ? <p className="vacio">Cargando…</p> : null}
        </main>
      </>
    );
  }

  const { galeria, fotos, totalFotos, enlace } = detalle;
  const esBorrador = galeria.estado === 'borrador';

  return (
    <>
      <Encabezado titulo={galeria.nombre} volverA="/" />
      <main className="contenido">
        <Aviso error={error} mensaje={mensaje} />

        <section className="tarjeta">
          <h2>
            Estado <EstadoDeGaleria estado={galeria.estado} />
          </h2>
          <p className="vacio">
            {galeria.clienteNombre} · {galeria.clienteCorreo} · hasta {galeria.limiteVigente} foto(s)
            {galeria.limiteExtra > 0 ? ` (${galeria.limiteIncluido} + ${galeria.limiteExtra} extra)` : ''}
          </p>

          <label>Enlace privado para el cliente</label>
          <EnlaceCopiable enlace={enlace} />

          <div className="acciones">
            {esBorrador ? (
              <button
                onClick={() => hacer(() => api.publicar(id), 'Galería publicada. Se avisó al cliente por correo.')}
                disabled={ocupado || totalFotos === 0}
                title={totalFotos === 0 ? 'Primero sube al menos una foto' : 'Publicar y avisar al cliente'}
              >
                Publicar y avisar al cliente
              </button>
            ) : (
              <Link to={`/galerias/${id}/seleccion`}>
                <button className="secundario">Ver la selección del cliente</button>
              </Link>
            )}
            <button className="peligro" onClick={eliminar} disabled={ocupado}>
              Eliminar sesión
            </button>
          </div>
        </section>

        <section className="tarjeta">
          <h2>Fotos ({totalFotos})</h2>

          <label htmlFor="archivos">Subir fotos (JPG, PNG o WebP)</label>
          <input
            id="archivos"
            ref={entrada}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={subir}
            disabled={ocupado}
          />

          {fotos.length === 0 ? (
            <p className="vacio" style={{ marginTop: 14 }}>
              Todavía no hay fotos en esta sesión.
            </p>
          ) : (
            <div className="rejilla" style={{ marginTop: 14 }}>
              {fotos.map((foto) => (
                <figure className="foto" key={foto.id} style={{ margin: 0 }}>
                  {foto.urlMiniatura ? (
                    <img src={foto.urlMiniatura} alt={foto.nombreArchivo} loading="lazy" />
                  ) : (
                    <div className="procesando">
                      {foto.estado === 'error' ? 'No se pudo procesar' : 'Generando miniatura…'}
                    </div>
                  )}
                </figure>
              ))}
            </div>
          )}
        </section>

        <section className="tarjeta">
          <h2>Ajustes de la sesión</h2>
          <div className="campos">
            <div>
              <label htmlFor="nombreEdicion">Nombre</label>
              <input
                id="nombreEdicion"
                value={edicion.nombre}
                onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="limiteEdicion">Fotos incluidas en el paquete</label>
              <input
                id="limiteEdicion"
                type="number"
                min="1"
                value={edicion.limiteIncluido}
                onChange={(e) => setEdicion({ ...edicion, limiteIncluido: e.target.value })}
              />
            </div>
          </div>
          <div className="acciones">
            <button
              className="secundario"
              disabled={ocupado}
              onClick={() =>
                hacer(
                  () =>
                    api.editarGaleria(id, {
                      nombre: edicion.nombre,
                      limiteIncluido: Number(edicion.limiteIncluido),
                    }),
                  'Sesión actualizada.',
                )
              }
            >
              Guardar cambios
            </button>
            <span className="vacio">
              El límite no puede quedar por debajo de lo que el cliente ya eligió.
            </span>
          </div>
        </section>

        <section className="tarjeta">
          <h2>Fotos extra (opcional)</h2>
          <div className="campos">
            <div>
              <label htmlFor="precio">Precio por foto extra</label>
              <input
                id="precio"
                type="number"
                min="1"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="15000"
              />
            </div>
          </div>
          <div className="acciones">
            <button
              className="secundario"
              disabled={ocupado || !precio}
              onClick={() =>
                hacer(() => api.definirPrecioExtra(id, Number(precio)), 'Precio guardado.')
              }
            >
              Guardar precio
            </button>
            <span className="vacio">
              Con un precio definido, el cliente puede pedir fotos de más con pago simulado.
            </span>
          </div>
        </section>
      </main>
    </>
  );
}
