import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Aviso, Encabezado, EstadoDeGaleria } from '../componentes.jsx';

const NUEVA = { nombre: '', clienteNombre: '', clienteCorreo: '', limiteIncluido: 20 };

/** HU-04, HU-05: listado y creación de sesiones. */
export default function Panel() {
  const [galerias, setGalerias] = useState([]);
  const [nueva, setNueva] = useState(NUEVA);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);

  async function recargar() {
    try {
      setGalerias(await api.misGalerias());
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    recargar();
  }, []);

  const cambiar = (campo) => (evento) => setNueva({ ...nueva, [campo]: evento.target.value });

  async function crear(evento) {
    evento.preventDefault();
    setCreando(true);
    setError('');

    try {
      await api.crearGaleria({ ...nueva, limiteIncluido: Number(nueva.limiteIncluido) });
      setNueva(NUEVA);
      await recargar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCreando(false);
    }
  }

  return (
    <>
      <Encabezado titulo="Mis sesiones" />
      <main className="contenido">
        <Aviso error={error} />

        <section className="tarjeta">
          <h2>Nueva sesión</h2>
          <form onSubmit={crear}>
            <div className="campos">
              <div>
                <label htmlFor="nombre">Nombre de la sesión</label>
                <input
                  id="nombre"
                  value={nueva.nombre}
                  onChange={cambiar('nombre')}
                  placeholder="Sesión de grado · Laura"
                  required
                />
              </div>
              <div>
                <label htmlFor="clienteNombre">Nombre del cliente</label>
                <input
                  id="clienteNombre"
                  value={nueva.clienteNombre}
                  onChange={cambiar('clienteNombre')}
                  required
                />
              </div>
              <div>
                <label htmlFor="clienteCorreo">Correo del cliente</label>
                <input
                  id="clienteCorreo"
                  type="email"
                  value={nueva.clienteCorreo}
                  onChange={cambiar('clienteCorreo')}
                  required
                />
              </div>
              <div>
                <label htmlFor="limite">Fotos que incluye el paquete</label>
                <input
                  id="limite"
                  type="number"
                  min="1"
                  value={nueva.limiteIncluido}
                  onChange={cambiar('limiteIncluido')}
                  required
                />
              </div>
            </div>

            <div className="acciones">
              <button type="submit" disabled={creando}>
                {creando ? 'Creando…' : 'Crear sesión'}
              </button>
              <span className="vacio">Se crea en borrador, con su enlace privado listo.</span>
            </div>
          </form>
        </section>

        <section className="tarjeta">
          <h2>Sesiones ({galerias.length})</h2>

          {cargando ? (
            <p className="vacio">Cargando…</p>
          ) : galerias.length === 0 ? (
            <p className="vacio">Todavía no tienes sesiones. Crea la primera arriba.</p>
          ) : (
            <ul className="lista">
              {galerias.map((galeria) => (
                <li key={galeria.id}>
                  <div>
                    <Link to={`/galerias/${galeria.id}`}>
                      <strong>{galeria.nombre}</strong>
                    </Link>
                    <div className="vacio">
                      {galeria.clienteNombre} · hasta {galeria.limiteVigente} foto(s)
                    </div>
                  </div>
                  <EstadoDeGaleria estado={galeria.estado} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
