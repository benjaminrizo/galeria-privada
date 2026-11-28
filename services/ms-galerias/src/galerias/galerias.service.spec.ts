import { EstadoDeGaleria, Galeria, limiteVigente } from './galeria.entity';
import { GaleriasService } from './galerias.service';

function galeriaDePrueba(cambios: Partial<Galeria> = {}): Galeria {
  return {
    id: 'galeria-1',
    fotografoId: 'fotografo-1',
    nombre: 'Boda de prueba',
    clienteNombre: 'Cliente',
    clienteCorreo: 'cliente@correo.com',
    limiteIncluido: 10,
    limiteExtra: 0,
    precioFotoExtra: null,
    estado: EstadoDeGaleria.Borrador,
    creadoEn: new Date(),
    publicadaEn: null,
    ...cambios,
  } as Galeria;
}

/**
 * Las invariantes del agregado Galería (AG-03): el estado solo avanza de
 * borrador a publicada y de publicada a selección enviada, y una galería solo
 * la ve y la toca su dueño.
 */
describe('GaleriasService', () => {
  let repositorio: any;
  let bus: any;
  let servicio: GaleriasService;

  beforeEach(() => {
    repositorio = {
      findOneBy: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((datos: any) => ({ id: 'galeria-1', ...datos })),
      save: jest.fn(async (entidad: any) => entidad),
    };
    bus = { publicar: jest.fn().mockResolvedValue(undefined) };
    servicio = new GaleriasService(repositorio, bus);
  });

  describe('límite vigente', () => {
    it('suma el incluido y el extra', () => {
      expect(limiteVigente(galeriaDePrueba({ limiteIncluido: 10, limiteExtra: 3 }))).toBe(13);
    });
  });

  describe('publicar', () => {
    it('pasa la galería de borrador a publicada y guarda la fecha', async () => {
      repositorio.findOneBy.mockResolvedValue(galeriaDePrueba());

      await servicio.publicar('galeria-1', { fotografoId: 'fotografo-1', cantidadFotos: 4 } as any);

      const guardada = repositorio.save.mock.calls[0][0];
      expect(guardada.estado).toBe(EstadoDeGaleria.Publicada);
      expect(guardada.publicadaEn).toBeInstanceOf(Date);
    });

    it('no republica una galería que ya está publicada', async () => {
      repositorio.findOneBy.mockResolvedValue(
        galeriaDePrueba({ estado: EstadoDeGaleria.Publicada }),
      );

      await expect(
        servicio.publicar('galeria-1', { fotografoId: 'fotografo-1', cantidadFotos: 4 } as any),
      ).rejects.toMatchObject({ response: { codigo: 'ESTADO_INVALIDO' } });
      expect(repositorio.save).not.toHaveBeenCalled();
    });

    it('no publica una galería sin fotos', async () => {
      repositorio.findOneBy.mockResolvedValue(galeriaDePrueba());

      await expect(
        servicio.publicar('galeria-1', { fotografoId: 'fotografo-1', cantidadFotos: 0 } as any),
      ).rejects.toMatchObject({ response: { codigo: 'SIN_FOTOS' } });
    });
  });

  describe('propiedad de la galería', () => {
    it('no deja que un fotógrafo vea la galería de otro', async () => {
      repositorio.findOneBy.mockResolvedValue(galeriaDePrueba({ fotografoId: 'otro-fotografo' }));

      await expect(servicio.obtener('galeria-1', 'fotografo-1')).rejects.toMatchObject({
        response: { codigo: 'GALERIA_NO_ENCONTRADA' },
      });
    });

    it('responde lo mismo si la galería no existe que si es de otro', async () => {
      // Devolver un error distinto revelaría qué galerías existen.
      repositorio.findOneBy.mockResolvedValue(null);

      await expect(servicio.obtener('galeria-1', 'fotografo-1')).rejects.toMatchObject({
        response: { codigo: 'GALERIA_NO_ENCONTRADA' },
      });
    });
  });

  describe('editar', () => {
    it('no deja bajar el límite por debajo de lo que el cliente ya marcó', async () => {
      repositorio.findOneBy.mockResolvedValue(galeriaDePrueba({ limiteIncluido: 10 }));

      await expect(
        servicio.editar('galeria-1', {
          fotografoId: 'fotografo-1',
          limiteIncluido: 3,
          cantidadMarcadas: 7,
        } as any),
      ).rejects.toMatchObject({ response: { codigo: 'LIMITE_MENOR_A_SELECCION' } });
    });

    it('sí deja bajar el límite hasta justo lo marcado', async () => {
      repositorio.findOneBy.mockResolvedValue(galeriaDePrueba({ limiteIncluido: 10 }));

      await servicio.editar('galeria-1', {
        fotografoId: 'fotografo-1',
        limiteIncluido: 7,
        cantidadMarcadas: 7,
      } as any);

      expect(repositorio.save.mock.calls[0][0].limiteIncluido).toBe(7);
    });
  });
});
