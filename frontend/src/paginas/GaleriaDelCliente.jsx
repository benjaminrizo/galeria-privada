import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiCliente } from '../api.js';
import { Aviso } from '../componentes.jsx';

/**
 * Vista del cliente (HU-03, HU-09 a HU-15, HU-20).
 *
 * Entra con el enlace privado, sin cuenta (ADR 0001), y solo ve miniaturas
 * (RNF-04). El contador bloquea al llegar al límite del paquete (HU-11).
 */
export default function GaleriaDelCliente() {
  const { codigo } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [comentarios, setComentarios] = useState({});

  async function recargar(pagina = 1) {
    try {
      const respuesta = await apiCliente.abrir(codigo, pagina);
      setDatos(respuesta);
      setComentarios(
        Object.fromEntries(respuesta.fotos.map((foto) => [foto.id, foto.comentario ?? ''])),
      );
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  useEffect(() => {
    recargar();
  }, [codigo]);

  async function alternar(foto) {
    setOcupado(true);
    setError('');
    setMensaje('');

    try {
      if (foto.marcada) await apiCliente.desmarcar(codigo, foto.id);
      else await apiCliente.marcar(codigo, foto.id);
      await recargar(datos.pagina);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function guardarComentario(fotoId) {
    setOcupado(true);
    setError('');

    try {
      await apiCliente.comentar(codigo, fotoId, comentarios[fotoId] || '');
      setMensaje('Comentario guardado.');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function enviar() {
    if (!window.confirm('Después de enviar no podrás cambiar tu selección. ¿Enviar ahora?')) return;

    setOcupado(true);
    setError('');

    try {
      await apiCliente.enviar(codigo);
      setMensaje('¡Listo! Tu selección ya le llegó a tu fotógrafo.');
      await recargar(datos.pagina);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function pedirExtra() {
    const respuesta = window.prompt('¿Cuántas fotos extra quieres pedir?', '1');
    const cantidad = Number(respuesta);
    if (!cantidad || cantidad < 1) return;

    setOcupado(true);
    setError('');

    try {
      const pedido = await apiCliente.pedirFotosExtra(codigo, cantidad);
      setMensaje(`Pedido confirmado por ${pedido.total}. Ahora puedes elegir ${pedido.limiteVigente} fotos.`);
      await recargar(datos.pagina);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  if (!datos) {
    return (
      <main className="contenido">
        <Aviso error={error} />
        {!error ? <p className="vacio">Cargando tu galería…</p> : null}
      </main>
    );
  }

  const { galeria, seleccion, fotos, totalFotos } = datos;
  const enviada = seleccion.estado === 'enviada';
  const alLimite = seleccion.cantidad >= seleccion.limiteVigente;
  const paginas = Math.max(1, Math.ceil(totalFotos / datos.porPagina));

  return (
    <>
      <div className="contador">
        <div>
          <strong>
            {seleccion.cantidad} de {seleccion.limiteVigente} fotos elegidas
          </strong>
          <div className="vacio">
            {galeria.nombre} · Hola, {galeria.clienteNombre}
          </div>
        </div>
        <div className="acciones" style={{ marginTop: 0 }}>
          {galeria.precioFotoExtra && !enviada ? (
            <button className="secundario" onClick={pedirExtra} disabled={ocupado}>
              Pedir fotos extra
            </button>
          ) : null}
          <button onClick={enviar} disabled={ocupado || enviada || seleccion.cantidad === 0}>
            {enviada ? 'Selección enviada' : 'Enviar mi selección'}
          </button>
        </div>
      </div>

      <main className="contenido">
        <Aviso error={error} mensaje={mensaje} />

        {enviada ? (
          <p className="aviso">
            Ya enviaste tu selección, así que la galería queda como está. Si necesitas un cambio,
            escríbele a tu fotógrafo.
          </p>
        ) : alLimite ? (
          <p className="aviso">
            Llegaste al límite de tu paquete. Desmarca alguna foto si quieres cambiar tu elección.
          </p>
        ) : null}

        <div className="rejilla">
          {fotos.map((foto) => (
            <figure className={`foto${foto.marcada ? ' marcada' : ''}`} key={foto.id} style={{ margin: 0 }}>
              {foto.urlMiniatura ? (
                <img src={foto.urlMiniatura} alt="Foto de tu sesión" loading="lazy" />
              ) : (
                <div className="procesando">
                  {foto.estado === 'error' ? 'No disponible' : 'Preparando…'}
                </div>
              )}

              <div className="pie">
                <button
                  className={foto.marcada ? 'secundario' : ''}
                  onClick={() => alternar(foto)}
                  disabled={ocupado || enviada || (!foto.marcada && alLimite) || !foto.urlMiniatura}
                >
                  {foto.marcada ? 'Quitar' : 'Elegir'}
                </button>

                {foto.marcada && !enviada ? (
                  <>
                    <label htmlFor={`comentario-${foto.id}`}>Retoque que quieres</label>
                    <textarea
                      id={`comentario-${foto.id}`}
                      value={comentarios[foto.id] ?? ''}
                      onChange={(e) => setComentarios({ ...comentarios, [foto.id]: e.target.value })}
                      onBlur={() => guardarComentario(foto.id)}
                      placeholder="Por ejemplo: aclarar un poco y recortar el fondo."
                    />
                  </>
                ) : foto.comentario ? (
                  <span className="vacio" style={{ fontSize: '0.8rem' }}>“{foto.comentario}”</span>
                ) : null}
              </div>
            </figure>
          ))}
        </div>

        {paginas > 1 ? (
          <div className="acciones">
            <button
              className="secundario"
              disabled={datos.pagina <= 1}
              onClick={() => recargar(datos.pagina - 1)}
            >
              Anteriores
            </button>
            <span className="vacio">
              Página {datos.pagina} de {paginas}
            </span>
            <button
              className="secundario"
              disabled={datos.pagina >= paginas}
              onClick={() => recargar(datos.pagina + 1)}
            >
              Siguientes
            </button>
          </div>
        ) : null}
      </main>
    </>
  );
}
