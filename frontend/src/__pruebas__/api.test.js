import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ErrorDeApi, sesion } from '../api.js';

/**
 * El frontend es un consumidor más del gateway (ADR 0002). Lo que importa es
 * que adjunte el token cuando hay sesión y que conserve el `codigo` de error
 * del backend, porque las pantallas reaccionan a ese código y no al texto.
 */
describe('sesión', () => {
  beforeEach(() => localStorage.clear());

  it('guarda y recupera el token y el nombre', () => {
    sesion.guardar('un-token', 'Gianka');
    expect(sesion.token()).toBe('un-token');
    expect(sesion.nombre()).toBe('Gianka');
  });

  it('al cerrar no deja rastro del token', () => {
    sesion.guardar('un-token', 'Gianka');
    sesion.cerrar();
    expect(sesion.token()).toBeNull();
    expect(sesion.nombre()).toBeNull();
    expect(JSON.stringify(localStorage)).not.toContain('un-token');
  });
});

describe('llamadas al gateway', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  const respuesta = (estado, cuerpo) => ({
    ok: estado >= 200 && estado < 300,
    status: estado,
    json: async () => cuerpo,
  });

  it('va siempre contra /api, nunca contra un microservicio', async () => {
    fetch.mockResolvedValue(respuesta(200, { galerias: [] }));
    await api.registro({ nombre: 'G' });

    expect(fetch.mock.calls[0][0].startsWith('/api/')).toBe(true);
  });

  it('adjunta el token cuando hay sesión', async () => {
    sesion.guardar('un-token', 'Gianka');
    fetch.mockResolvedValue(respuesta(200, {}));

    await api.registro({});

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer un-token');
  });

  it('no inventa una cabecera de sesión si no hay token', async () => {
    fetch.mockResolvedValue(respuesta(200, {}));
    await api.registro({});

    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('conserva el código de error que manda el backend', async () => {
    fetch.mockResolvedValue(
      respuesta(409, { codigo: 'LIMITE_ALCANZADO', mensaje: 'Ya elegiste 10 de 10 fotos.' }),
    );

    await expect(api.registro({})).rejects.toMatchObject({
      codigo: 'LIMITE_ALCANZADO',
      estado: 409,
    });
  });

  it('da un error legible aunque el backend no mande cuerpo', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('vacío'); } });

    const error = await api.registro({}).catch((e) => e);
    expect(error).toBeInstanceOf(ErrorDeApi);
    expect(error.codigo).toBe('ERROR');
    expect(error.message).toBeTruthy();
  });
});
