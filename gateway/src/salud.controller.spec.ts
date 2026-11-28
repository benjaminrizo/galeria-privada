import { SaludController } from './salud.controller';

/**
 * Para el gateway «estar listo» no es solo estar vivo: si no alcanza a los
 * servicios del MVP no puede orquestar nada. Los de prioridad posterior no
 * deben tumbar la respuesta.
 */
describe('SaludController del gateway', () => {
  const clienteQueResponde = () => ({ get: jest.fn().mockResolvedValue({ estado: 'vivo' }) });
  const clienteCaido = () => ({ get: jest.fn().mockRejectedValue(new Error('sin respuesta')) });

  it('responde a /ping sin consultar a ningún servicio', () => {
    const auth = clienteQueResponde();
    const controlador = new SaludController(
      auth as any, clienteQueResponde() as any, clienteQueResponde() as any,
      clienteQueResponde() as any, clienteQueResponde() as any,
    );

    expect(controlador.ping().estado).toBe('vivo');
    expect(auth.get).not.toHaveBeenCalled();
  });

  it('está listo cuando todos los servicios del MVP responden', async () => {
    const controlador = new SaludController(
      clienteQueResponde() as any, clienteQueResponde() as any, clienteQueResponde() as any,
      clienteQueResponde() as any, clienteQueResponde() as any,
    );

    const resultado: any = await controlador.health();
    expect(resultado.estado).toBe('listo');
    expect(resultado.servicios['ms-auth']).toBe('ok');
  });

  it('no está listo si un servicio del MVP no responde', async () => {
    const controlador = new SaludController(
      clienteCaido() as any, clienteQueResponde() as any, clienteQueResponde() as any,
      clienteQueResponde() as any, clienteQueResponde() as any,
    );

    await expect(controlador.health()).rejects.toMatchObject({
      response: { codigo: 'NO_LISTO' },
    });
  });

  it('sigue listo si solo falla un servicio de prioridad posterior', async () => {
    // ms-pagos es prioridad Extra: que se caiga no deja el sistema inservible.
    const controlador = new SaludController(
      clienteQueResponde() as any, clienteQueResponde() as any, clienteQueResponde() as any,
      clienteQueResponde() as any, clienteCaido() as any,
    );

    const resultado: any = await controlador.health();
    expect(resultado.estado).toBe('listo');
    expect(resultado.servicios['ms-pagos']).toBe('sin respuesta');
  });
});
