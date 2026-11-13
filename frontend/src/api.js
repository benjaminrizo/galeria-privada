/**
 * Único punto de contacto con el backend: el API Gateway (ADR 0002).
 * El frontend nunca llama a un microservicio directamente.
 */

const CLAVE_TOKEN = 'galeria-privada.token';
const CLAVE_NOMBRE = 'galeria-privada.nombre';

export const sesion = {
  token: () => localStorage.getItem(CLAVE_TOKEN),
  nombre: () => localStorage.getItem(CLAVE_NOMBRE),
  guardar: (token, nombre) => {
    localStorage.setItem(CLAVE_TOKEN, token);
    if (nombre) localStorage.setItem(CLAVE_NOMBRE, nombre);
  },
  cerrar: () => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_NOMBRE);
  },
};

/** Error con el `codigo` que devuelve el backend, para poder reaccionar a él. */
export class ErrorDeApi extends Error {
  constructor(codigo, mensaje, estado) {
    super(mensaje);
    this.codigo = codigo;
    this.estado = estado;
  }
}

async function pedir(ruta, { metodo = 'GET', cuerpo, archivos } = {}) {
  const cabeceras = {};
  const token = sesion.token();
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo) cabeceras['Content-Type'] = 'application/json';

  const respuesta = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: archivos || (cuerpo ? JSON.stringify(cuerpo) : undefined),
  });

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new ErrorDeApi(
      datos.codigo || 'ERROR',
      datos.mensaje || 'No se pudo completar la operación.',
      respuesta.status,
    );
  }

  return datos;
}

/** Operaciones del fotógrafo (G-01 a G-11). */
export const api = {
  registro: (datos) => pedir('/auth/registro', { metodo: 'POST', cuerpo: datos }),
  login: (datos) => pedir('/auth/login', { metodo: 'POST', cuerpo: datos }),

  misGalerias: () => pedir('/galerias'),
  crearGaleria: (datos) => pedir('/galerias', { metodo: 'POST', cuerpo: datos }),
  galeria: (id) => pedir(`/galerias/${id}`),
  editarGaleria: (id, datos) => pedir(`/galerias/${id}`, { metodo: 'PATCH', cuerpo: datos }),
  eliminarGaleria: (id) => pedir(`/galerias/${id}`, { metodo: 'DELETE' }),
  publicar: (id) => pedir(`/galerias/${id}/publicacion`, { metodo: 'POST' }),
  seleccionRecibida: (id) => pedir(`/galerias/${id}/seleccion`),
  definirPrecioExtra: (id, precio) =>
    pedir(`/galerias/${id}/precio-foto-extra`, { metodo: 'PUT', cuerpo: { precio } }),

  subirFotos: (id, listaDeArchivos) => {
    const formulario = new FormData();
    for (const archivo of listaDeArchivos) formulario.append('archivos', archivo);
    return pedir(`/galerias/${id}/fotos`, { metodo: 'POST', archivos: formulario });
  },
};

/** Operaciones del cliente por enlace privado (G-12 a G-17). */
export const apiCliente = {
  abrir: (codigo, pagina = 1) => pedir(`/c/${codigo}?pagina=${pagina}`),
  marcar: (codigo, fotoId) => pedir(`/c/${codigo}/seleccion/fotos/${fotoId}`, { metodo: 'PUT' }),
  desmarcar: (codigo, fotoId) => pedir(`/c/${codigo}/seleccion/fotos/${fotoId}`, { metodo: 'DELETE' }),
  comentar: (codigo, fotoId, comentario) =>
    pedir(`/c/${codigo}/seleccion/fotos/${fotoId}/comentario`, {
      metodo: 'PUT',
      cuerpo: { comentario },
    }),
  enviar: (codigo) => pedir(`/c/${codigo}/seleccion/envio`, { metodo: 'POST' }),
  pedirFotosExtra: (codigo, cantidad) =>
    pedir(`/c/${codigo}/pedidos`, { metodo: 'POST', cuerpo: { cantidad } }),
};
