import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, sesion } from '../api.js';
import { Aviso, Encabezado } from '../componentes.jsx';

/** HU-01: registro e inicio de sesión del fotógrafo. */
export default function Acceso() {
  const navegar = useNavigate();
  const [modo, setModo] = useState('login');
  const [datos, setDatos] = useState({ nombre: '', correo: '', password: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (evento) => setDatos({ ...datos, [campo]: evento.target.value });

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    setMensaje('');
    setEnviando(true);

    try {
      if (modo === 'registro') {
        await api.registro(datos);
        setMensaje('Cuenta creada. Ya puedes iniciar sesión.');
        setModo('login');
      } else {
        const respuesta = await api.login({ correo: datos.correo, password: datos.password });
        sesion.guardar(respuesta.token, respuesta.nombre);
        navegar('/', { replace: true });
      }
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Encabezado titulo="Galería Privada" />
      <main className="contenido" style={{ maxWidth: 440 }}>
        <div className="tarjeta">
          <h2>{modo === 'login' ? 'Entrar a mi cuenta' : 'Crear una cuenta'}</h2>
          <Aviso error={error} mensaje={mensaje} />

          <form onSubmit={enviar}>
            <div className="campos" style={{ gridTemplateColumns: '1fr' }}>
              {modo === 'registro' ? (
                <div>
                  <label htmlFor="nombre">Nombre</label>
                  <input id="nombre" value={datos.nombre} onChange={cambiar('nombre')} required />
                </div>
              ) : null}

              <div>
                <label htmlFor="correo">Correo</label>
                <input
                  id="correo"
                  type="email"
                  value={datos.correo}
                  onChange={cambiar('correo')}
                  required
                />
              </div>

              <div>
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={datos.password}
                  onChange={cambiar('password')}
                  minLength={modo === 'registro' ? 8 : undefined}
                  required
                />
              </div>
            </div>

            <div className="acciones">
              <button type="submit" disabled={enviando}>
                {enviando ? 'Un momento…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>
              <button
                type="button"
                className="secundario"
                onClick={() => {
                  setModo(modo === 'login' ? 'registro' : 'login');
                  setError('');
                  setMensaje('');
                }}
              >
                {modo === 'login' ? 'No tengo cuenta' : 'Ya tengo cuenta'}
              </button>
            </div>
          </form>
        </div>

        <p className="vacio">
          Si eres cliente, entra con el enlace privado que te envió tu fotógrafo. No necesitas cuenta.
        </p>
      </main>
    </>
  );
}
