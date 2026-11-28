import { FotosService } from './fotos.service';

/**
 * Invariantes del agregado Foto (AG-04): solo se admiten formatos de imagen
 * permitidos, y una foto rechazada no llega ni al almacén ni a la base de
 * datos. Que una subida parcial deje basura a medias es justo el fallo que
 * esta prueba vigila.
 */
describe('FotosService · subida', () => {
  let repositorio: any;
  let almacenamiento: any;
  let bus: any;
  let servicio: FotosService;

  const archivo = (originalname: string, mimetype: string) => ({
    originalname,
    mimetype,
    buffer: Buffer.from('contenido-de-prueba'),
    size: 19,
  });

  beforeEach(() => {
    repositorio = {
      create: jest.fn((datos: any) => ({ id: 'foto-1', ...datos })),
      save: jest.fn(async (entidad: any) => entidad),
    };
    almacenamiento = { guardar: jest.fn().mockResolvedValue(undefined) };
    bus = { publicar: jest.fn().mockResolvedValue(undefined) };
    servicio = new FotosService(repositorio, almacenamiento, bus);
  });

  it('rechaza una subida sin archivos', async () => {
    await expect(servicio.subir('galeria-1', [])).rejects.toMatchObject({
      response: { codigo: 'DATOS_INVALIDOS' },
    });
  });

  it('acepta JPG, PNG y WebP', async () => {
    const resultado: any = await servicio.subir('galeria-1', [
      archivo('a.jpg', 'image/jpeg'),
      archivo('b.png', 'image/png'),
      archivo('c.webp', 'image/webp'),
    ] as any);

    expect(resultado.aceptadas).toHaveLength(3);
    expect(resultado.rechazadas).toHaveLength(0);
  });

  it('rechaza un PDF disfrazado sin guardarlo en ningún sitio', async () => {
    const resultado: any = await servicio.subir('galeria-1', [
      archivo('factura.pdf', 'application/pdf'),
    ] as any);

    expect(resultado.aceptadas).toHaveLength(0);
    expect(resultado.rechazadas[0].motivo).toContain('Formato no permitido');
    expect(almacenamiento.guardar).not.toHaveBeenCalled();
    expect(repositorio.save).not.toHaveBeenCalled();
  });

  it('acepta las válidas aunque vengan mezcladas con una inválida', async () => {
    const resultado: any = await servicio.subir('galeria-1', [
      archivo('buena.jpg', 'image/jpeg'),
      archivo('mala.gif', 'image/gif'),
    ] as any);

    expect(resultado.aceptadas).toHaveLength(1);
    expect(resultado.rechazadas).toHaveLength(1);
  });

  it('guarda el original en el almacén antes de registrar la foto', async () => {
    await servicio.subir('galeria-1', [archivo('a.jpg', 'image/jpeg')] as any);

    const [, clave] = almacenamiento.guardar.mock.calls[0];
    // La clave lleva el identificador de la galería delante: así los archivos
    // de una galería quedan agrupados y se borran juntos.
    expect(clave.startsWith('galeria-1/')).toBe(true);
  });

  it('no pierde la foto si el broker falla al anunciar la miniatura', async () => {
    // La foto ya está guardada: el aviso es secundario (HT-06).
    bus.publicar.mockRejectedValue(new Error('broker caído'));

    const resultado: any = await servicio.subir('galeria-1', [
      archivo('a.jpg', 'image/jpeg'),
    ] as any);

    expect(resultado.aceptadas).toHaveLength(1);
  });
});
