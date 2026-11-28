import { AccesosService } from './accesos.service';

/**
 * El enlace es la única llave del cliente (ADR 0001), así que el código tiene
 * que ser largo, aleatorio e imposible de adivinar (RNF-02). Si esto se
 * debilita, cualquiera entra a galerías ajenas.
 */
describe('AccesosService', () => {
  let repositorio: any;
  let servicio: AccesosService;

  beforeEach(() => {
    repositorio = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((datos: any) => ({ id: 'id', ...datos })),
      save: jest.fn(async (entidad: any) => entidad),
    };
    servicio = new AccesosService(repositorio);
  });

  it('genera códigos largos, distintos y sin caracteres problemáticos en una URL', async () => {
    const vistos = new Set<string>();

    for (let i = 0; i < 200; i++) {
      const { codigo } = await servicio.generar(`galeria-${i}`);
      expect(codigo.length).toBeGreaterThanOrEqual(32);
      expect(codigo).toMatch(/^[A-Za-z0-9_-]+$/); // base64url: seguro en una URL
      expect(vistos.has(codigo)).toBe(false);
      vistos.add(codigo);
    }
  });

  it('no crea un enlace nuevo si la galería ya tiene uno', async () => {
    repositorio.findOneBy.mockResolvedValue({ codigo: 'el-de-siempre' });

    const { codigo } = await servicio.generar('galeria-1');

    expect(codigo).toBe('el-de-siempre');
    expect(repositorio.save).not.toHaveBeenCalled();
  });

  it('no resuelve un código que no existe o que está desactivado', async () => {
    repositorio.findOneBy.mockResolvedValue(null);

    await expect(servicio.resolver('codigo-inventado')).rejects.toMatchObject({
      response: { codigo: expect.any(String) },
    });
  });
});
