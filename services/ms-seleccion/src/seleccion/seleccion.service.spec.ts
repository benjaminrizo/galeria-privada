import { EstadoDeSeleccion } from './seleccion.entity';
import { SeleccionService } from './seleccion.service';

/**
 * Invariantes del agregado Selección (AG-05): no se pasa del límite vigente,
 * no se modifica una vez enviada, y volver a marcar lo ya marcado no suma.
 * Son las reglas que impiden que el cliente se lleve más fotos de las pagadas.
 */
describe('SeleccionService · marcar', () => {
  let selecciones: any;
  let marcadas: any;
  let fuente: any;
  let gestor: any;
  let servicio: SeleccionService;

  const seleccionEnCurso = { id: 'sel-1', galeriaId: 'galeria-1', estado: EstadoDeSeleccion.EnCurso };

  beforeEach(() => {
    gestor = {
      findOneBy: jest.fn().mockResolvedValue(null),
      countBy: jest.fn().mockResolvedValue(0),
      insert: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(seleccionEnCurso),
      save: jest.fn(async (_: any, e: any) => e),
      query: jest.fn().mockResolvedValue([seleccionEnCurso]),
    };
    selecciones = { findOneBy: jest.fn(), save: jest.fn(), create: jest.fn() };
    marcadas = { findOneBy: jest.fn(), count: jest.fn(), delete: jest.fn() };
    // La transacción se ejecuta de verdad, pero contra un gestor simulado.
    fuente = { transaction: jest.fn(async (cb: any) => cb(gestor)) };

    servicio = new SeleccionService(selecciones, marcadas, fuente);
    // obtenerOCrearBloqueada hace SELECT ... FOR UPDATE, que no tiene sentido
    // fuera de una base real: se sustituye por la selección de prueba.
    (servicio as any).obtenerOCrearBloqueada = jest.fn().mockResolvedValue(seleccionEnCurso);
  });

  it('marca una foto cuando queda sitio', async () => {
    gestor.countBy.mockResolvedValue(3);

    const resultado: any = await servicio.marcar('galeria-1', 'foto-9', 10);

    expect(gestor.insert).toHaveBeenCalled();
    expect(resultado.cantidad).toBe(4);
  });

  it('no deja pasar del límite vigente', async () => {
    gestor.countBy.mockResolvedValue(10);

    await expect(servicio.marcar('galeria-1', 'foto-11', 10)).rejects.toMatchObject({
      response: { codigo: 'LIMITE_ALCANZADO' },
    });
    expect(gestor.insert).not.toHaveBeenCalled();
  });

  it('marcar dos veces la misma foto no suma al conteo', async () => {
    gestor.findOneBy.mockResolvedValue({ seleccionId: 'sel-1', fotoId: 'foto-9' });
    gestor.countBy.mockResolvedValue(4);

    const resultado: any = await servicio.marcar('galeria-1', 'foto-9', 10);

    expect(resultado.cantidad).toBe(4);
    expect(gestor.insert).not.toHaveBeenCalled();
  });

  it('no admite cambios cuando la selección ya se envió', async () => {
    (servicio as any).obtenerOCrearBloqueada = jest
      .fn()
      .mockResolvedValue({ ...seleccionEnCurso, estado: EstadoDeSeleccion.Enviada });

    await expect(servicio.marcar('galeria-1', 'foto-9', 10)).rejects.toMatchObject({
      response: { codigo: 'SELECCION_ENVIADA' },
    });
  });
});
