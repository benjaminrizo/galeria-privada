import { Link, useNavigate } from 'react-router-dom';
import { sesion } from './api.js';

export function Encabezado({ titulo, volverA }) {
  const navegar = useNavigate();

  return (
    <header className="encabezado">
      <h1>
        {volverA ? <Link to={volverA}>←</Link> : null} {titulo}
      </h1>
      {sesion.token() ? (
        <div className="acciones" style={{ marginTop: 0 }}>
          <span className="etiqueta">{sesion.nombre() || 'Fotógrafo'}</span>
          <button
            className="secundario"
            onClick={() => {
              sesion.cerrar();
              navegar('/acceso', { replace: true });
            }}
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </header>
  );
}

export function Aviso({ error, mensaje }) {
  if (!error && !mensaje) return null;
  return <p className={`aviso${error ? ' error' : ''}`}>{error || mensaje}</p>;
}

const NOMBRES_DE_ESTADO = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  seleccion_enviada: 'Selección enviada',
};

export function EstadoDeGaleria({ estado }) {
  const clase = estado === 'publicada' ? 'publicada' : estado === 'seleccion_enviada' ? 'enviada' : '';
  return <span className={`etiqueta ${clase}`}>{NOMBRES_DE_ESTADO[estado] || estado}</span>;
}

export function EnlaceCopiable({ enlace }) {
  if (!enlace) return null;

  return (
    <div className="enlace-copiable">
      <code>{enlace}</code>
      <button
        className="secundario"
        onClick={() => navigator.clipboard?.writeText(enlace)}
        title="Copiar el enlace para enviárselo al cliente"
      >
        Copiar
      </button>
    </div>
  );
}
