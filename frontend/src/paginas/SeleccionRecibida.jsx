import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Aviso, Encabezado } from '../componentes.jsx';

/**
 * HU-14 y HU-16: el fotógrafo ve la selección enviada y, junto a cada foto, el
 * comentario de retoque. El original se abre con una URL temporal (HT-07).
 */
export default function SeleccionRecibida() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .seleccionRecibida(id)
      .then(setDatos)
      .catch((fallo) => setError(fallo.message));
  }, [id]);

  return (
    <>
      <Encabezado titulo="Selección del cliente" volverA={`/galerias/${id}`} />
      <main className="contenido">
        <Aviso error={error} />

        {!datos ? (
          !error ? <p className="vacio">Cargando…</p> : null
        ) : (
          <>
            <section className="tarjeta">
              <h2>{datos.galeria.nombre}</h2>
              <p className="vacio">
                {datos.estado === 'enviada'
                  ? `Selección enviada el ${new Date(datos.enviadaEn).toLocaleString('es-CO')}`
                  : 'El cliente todavía está eligiendo.'}{' '}
                · {datos.cantidad} foto(s)
              </p>
            </section>

            {datos.fotos.length === 0 ? (
              <p className="vacio">Todavía no hay fotos elegidas.</p>
            ) : (
              <div className="rejilla">
                {datos.fotos.map((foto) => (
                  <figure className="foto marcada" key={foto.fotoId} style={{ margin: 0 }}>
                    {foto.urlMiniatura ? (
                      <img src={foto.urlMiniatura} alt={foto.nombreArchivo} loading="lazy" />
                    ) : (
                      <div className="procesando">Sin miniatura</div>
                    )}
                    <div className="pie">
                      <strong style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {foto.nombreArchivo}
                      </strong>
                      <span className="vacio" style={{ fontSize: '0.8rem' }}>
                        {foto.comentario ? `“${foto.comentario}”` : 'Sin comentario de retoque'}
                      </span>
                      {foto.urlOriginal ? (
                        <a href={foto.urlOriginal} target="_blank" rel="noreferrer">
                          Abrir original
                        </a>
                      ) : null}
                    </div>
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
