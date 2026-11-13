import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ErrorDeNegocio } from '../comun/errores';
import { EstadoDeSeleccion, FotoSeleccionada, Seleccion } from './seleccion.entity';

@Injectable()
export class SeleccionService {
  private readonly log = new Logger('Seleccion');

  constructor(
    @InjectRepository(Seleccion)
    private readonly selecciones: Repository<Seleccion>,
    @InjectRepository(FotoSeleccionada)
    private readonly marcadas: Repository<FotoSeleccionada>,
    private readonly fuente: DataSource,
  ) {}

  /**
   * A-SEL-01 · MarcarFoto (HU-10, HU-11, HU-12).
   *
   * Va en una transacción con la selección bloqueada: si el cliente toca dos
   * fotos a la vez, el límite se sigue respetando y no se cuela una de más.
   */
  async marcar(galeriaId: string, fotoId: string, limiteVigente: number) {
    return this.fuente.transaction(async (gestor) => {
      const seleccion = await this.obtenerOCrearBloqueada(gestor, galeriaId);
      this.rechazarSiEnviada(seleccion);

      const yaMarcada = await gestor.findOneBy(FotoSeleccionada, {
        seleccionId: seleccion.id,
        fotoId,
      });

      // Idempotente: volver a marcar lo ya marcado no cambia nada ni suma al conteo.
      if (yaMarcada) {
        const cantidad = await gestor.countBy(FotoSeleccionada, { seleccionId: seleccion.id });
        return { cantidad, limiteVigente, estado: seleccion.estado };
      }

      const cantidad = await gestor.countBy(FotoSeleccionada, { seleccionId: seleccion.id });

      if (cantidad >= limiteVigente) {
        // EV-18: SeleccionRechazadaPorLimite
        throw ErrorDeNegocio.conflicto(
          'LIMITE_ALCANZADO',
          `Ya elegiste ${cantidad} de ${limiteVigente} fotos. Desmarca una para elegir otra.`,
        );
      }

      await gestor.insert(FotoSeleccionada, { seleccionId: seleccion.id, fotoId, comentario: null });

      // EV-16: FotoMarcada
      return { cantidad: cantidad + 1, limiteVigente, estado: seleccion.estado };
    });
  }

  /** A-SEL-02 · DesmarcarFoto (HU-10). Borra también su comentario. */
  async desmarcar(galeriaId: string, fotoId: string) {
    const seleccion = await this.selecciones.findOneBy({ galeriaId });

    // Sin selección no hay nada marcado; desmarcar es un no-op.
    if (!seleccion) return { cantidad: 0, estado: EstadoDeSeleccion.EnCurso };

    this.rechazarSiEnviada(seleccion);

    // El comentario vive en la misma fila, así que se va con ella.
    await this.marcadas.delete({ seleccionId: seleccion.id, fotoId });
    const cantidad = await this.marcadas.countBy({ seleccionId: seleccion.id });

    // EV-17: FotoDesmarcada
    return { cantidad, estado: seleccion.estado };
  }

  /** A-SEL-03 · GuardarComentario (HU-15). Reemplaza el anterior. */
  async guardarComentario(galeriaId: string, fotoId: string, comentario: string) {
    const seleccion = await this.selecciones.findOneBy({ galeriaId });

    if (!seleccion) {
      throw ErrorDeNegocio.conflicto('FOTO_NO_MARCADA', 'Primero hay que elegir la foto.');
    }

    this.rechazarSiEnviada(seleccion);

    const marcada = await this.marcadas.findOneBy({ seleccionId: seleccion.id, fotoId });

    // El comentario solo tiene sentido sobre una foto elegida (hotspot H-10).
    if (!marcada) {
      throw ErrorDeNegocio.conflicto('FOTO_NO_MARCADA', 'Primero hay que elegir la foto.');
    }

    const texto = comentario.trim();
    await this.marcadas.update(
      { seleccionId: seleccion.id, fotoId },
      { comentario: texto.length ? texto : null },
    );

    // EV-19: ComentarioGuardado
    return { fotoId, comentario: texto.length ? texto : null };
  }

  /** A-SEL-04 · EnviarSeleccion (HU-13). Después del envío queda bloqueada. */
  async enviar(galeriaId: string) {
    return this.fuente.transaction(async (gestor) => {
      const seleccion = await gestor.findOne(Seleccion, {
        where: { galeriaId },
        lock: { mode: 'pessimistic_write' },
      });

      // Supuesto acordado con el equipo: no se envía una selección vacía (HU-13).
      // Si no existe la selección, tampoco hay fotos elegidas.
      if (!seleccion) {
        throw ErrorDeNegocio.noProcesable('SELECCION_VACIA', 'Hay que elegir al menos una foto.');
      }

      this.rechazarSiEnviada(seleccion);

      const cantidad = await gestor.countBy(FotoSeleccionada, { seleccionId: seleccion.id });

      if (cantidad === 0) {
        throw ErrorDeNegocio.noProcesable('SELECCION_VACIA', 'Hay que elegir al menos una foto.');
      }

      await gestor.update(
        Seleccion,
        { id: seleccion.id },
        { estado: EstadoDeSeleccion.Enviada, enviadaEn: new Date() },
      );

      // EV-20: SeleccionEnviada (el evento de integración lo compone el gateway).
      this.log.log(`Selección enviada en la galería ${galeriaId} con ${cantidad} foto(s)`);
      return { cantidad, estado: EstadoDeSeleccion.Enviada };
    });
  }

  /** Q-SEL-01 · ObtenerSeleccion (HU-11, HU-12, HU-14, HU-16) */
  async obtener(galeriaId: string) {
    const seleccion = await this.selecciones.findOneBy({ galeriaId });

    // Si no existe todavía, se responde una selección vacía en curso.
    if (!seleccion) {
      return { galeriaId, estado: EstadoDeSeleccion.EnCurso, enviadaEn: null, cantidad: 0, fotos: [] };
    }

    const marcadas = await this.marcadas.find({
      where: { seleccionId: seleccion.id },
      order: { marcadaEn: 'ASC' },
    });

    return {
      galeriaId,
      estado: seleccion.estado,
      enviadaEn: seleccion.enviadaEn,
      cantidad: marcadas.length,
      fotos: marcadas.map((m) => ({ fotoId: m.fotoId, comentario: m.comentario })),
    };
  }

  /**
   * Reacción a `GaleriaEliminada`: borra la selección y sus comentarios.
   * Idempotente.
   */
  async borrarPorGaleria(galeriaId: string): Promise<void> {
    // Las fotos marcadas se van en cascada con la selección.
    const { affected } = await this.selecciones.delete({ galeriaId });
    this.log.log(`Selecciones borradas de la galería ${galeriaId}: ${affected ?? 0}`);
  }

  /**
   * Devuelve la selección de la galería creándola si hace falta, y la deja
   * bloqueada hasta el final de la transacción.
   */
  private async obtenerOCrearBloqueada(gestor: EntityManager, galeriaId: string): Promise<Seleccion> {
    const existente = await gestor.findOne(Seleccion, {
      where: { galeriaId },
      lock: { mode: 'pessimistic_write' },
    });
    if (existente) return existente;

    // Dos marcados simultáneos pueden intentar crearla a la vez. Se inserta
    // ignorando el conflicto del índice único en lugar de dejar que falle,
    // porque en PostgreSQL un insert fallido abortaría toda la transacción.
    await gestor
      .createQueryBuilder()
      .insert()
      .into(Seleccion)
      .values({ galeriaId, estado: EstadoDeSeleccion.EnCurso })
      .orIgnore()
      .execute();

    return gestor.findOne(Seleccion, {
      where: { galeriaId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  private rechazarSiEnviada(seleccion: Seleccion) {
    if (seleccion.estado === EstadoDeSeleccion.Enviada) {
      throw ErrorDeNegocio.conflicto(
        'SELECCION_ENVIADA',
        'La selección ya se envió y no admite cambios.',
      );
    }
  }
}
