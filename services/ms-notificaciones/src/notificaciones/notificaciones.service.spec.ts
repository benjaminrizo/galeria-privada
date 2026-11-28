import { EstadoDeNotificacion } from './notificacion.entity';
import { NotificacionesService } from './notificaciones.service';

/**
 * El agregado Notificación (AG-07) registra estado e intentos para poder
 * reintentar si el correo falla (HU-17). Lo que se prueba es que un fallo del
 * servidor de correo no se pierde en silencio y que, tras agotar los intentos,
 * la notificación queda marcada como fallida en lugar de reintentarse siempre.
 */
describe('NotificacionesService · envío', () => {
  let repositorio: any;
  let correo: any;
  let bus: any;
  let servicio: NotificacionesService;

  const pendiente = (intentos = 0) => ({
    id: 'notif-1',
    estado: EstadoDeNotificacion.Pendiente,
    intentos,
  });

  beforeEach(() => {
    repositorio = { update: jest.fn().mockResolvedValue(undefined), findOneBy: jest.fn(), find: jest.fn() };
    correo = { enviar: jest.fn().mockResolvedValue(undefined) };
    bus = { publicar: jest.fn(), suscribir: jest.fn() };
    servicio = new NotificacionesService(repositorio, correo, bus);
  });

  const enviar = (n: any) => (servicio as any).intentarEnvio(n);

  it('marca la notificación como enviada y guarda la fecha', async () => {
    await enviar(pendiente());

    const [, cambios] = repositorio.update.mock.calls[0];
    expect(cambios.estado).toBe(EstadoDeNotificacion.Enviada);
    expect(cambios.enviadoEn).toBeInstanceOf(Date);
    expect(cambios.ultimoError).toBeNull();
  });

  it('si el correo falla, la deja pendiente y anota el error', async () => {
    correo.enviar.mockRejectedValue(new Error('servidor de correo caído'));

    await enviar(pendiente(0));

    const [, cambios] = repositorio.update.mock.calls[0];
    expect(cambios.estado).toBe(EstadoDeNotificacion.Pendiente);
    expect(cambios.intentos).toBe(1);
    expect(cambios.ultimoError).toContain('servidor de correo caído');
  });

  it('tras agotar los intentos la da por fallida y deja de reintentar', async () => {
    correo.enviar.mockRejectedValue(new Error('sigue caído'));

    await enviar(pendiente(4)); // el quinto intento es el último

    const [, cambios] = repositorio.update.mock.calls[0];
    expect(cambios.intentos).toBe(5);
    expect(cambios.estado).toBe(EstadoDeNotificacion.Fallida);
  });

  it('no reenvía una notificación que ya se había enviado', async () => {
    await enviar({ id: 'notif-1', estado: EstadoDeNotificacion.Enviada, intentos: 1 });

    expect(correo.enviar).not.toHaveBeenCalled();
    expect(repositorio.update).not.toHaveBeenCalled();
  });

  it('recorta un mensaje de error larguísimo antes de guardarlo', async () => {
    correo.enviar.mockRejectedValue(new Error('x'.repeat(2000)));

    await enviar(pendiente());

    expect(repositorio.update.mock.calls[0][1].ultimoError.length).toBe(500);
  });
});
