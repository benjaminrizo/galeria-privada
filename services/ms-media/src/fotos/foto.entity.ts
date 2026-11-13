import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoDeProcesamiento {
  Pendiente = 'pendiente',
  Procesando = 'procesando',
  Lista = 'lista',
  Error = 'error',
}

/**
 * Agregado Foto (docs/EventStorming/06-modelado-de-datos.md).
 * La base guarda solo la ubicación de cada archivo; los archivos viven en el
 * almacenamiento privado (ADR 0005).
 */
@Entity('fotos')
export class Foto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referencia lógica a ms-galerias, sin clave foránea (RNF-15). */
  @Index()
  @Column({ name: 'galeria_id', type: 'uuid' })
  galeriaId: string;

  @Column({ name: 'nombre_archivo', type: 'text' })
  nombreArchivo: string;

  @Column({ name: 'clave_original', type: 'text' })
  claveOriginal: string;

  /** Vacío hasta que la miniatura se genera en segundo plano. */
  @Column({ name: 'clave_miniatura', type: 'text', default: '' })
  claveMiniatura: string;

  @Column({
    name: 'estado_procesamiento',
    type: 'enum',
    enum: EstadoDeProcesamiento,
    default: EstadoDeProcesamiento.Pendiente,
  })
  estadoProcesamiento: EstadoDeProcesamiento;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
