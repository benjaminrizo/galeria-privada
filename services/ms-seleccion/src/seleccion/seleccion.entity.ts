import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EstadoDeSeleccion {
  EnCurso = 'en_curso',
  Enviada = 'enviada',
}

/**
 * Agregado Selección (docs/EventStorming/06-modelado-de-datos.md).
 * Una galería tiene como máximo una selección. Este servicio no conoce el
 * límite del paquete: lo recibe del gateway en cada marcado (HT-12).
 */
@Entity('selecciones')
export class Seleccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referencia lógica a ms-galerias, única por galería (RNF-15). */
  @Index({ unique: true })
  @Column({ name: 'galeria_id', type: 'uuid' })
  galeriaId: string;

  @Column({ type: 'enum', enum: EstadoDeSeleccion, default: EstadoDeSeleccion.EnCurso })
  estado: EstadoDeSeleccion;

  @Column({ name: 'enviada_en', type: 'timestamptz', nullable: true })
  enviadaEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}

/**
 * Foto marcada, con su comentario de retoque (HU-15).
 * La clave primaria es compuesta, así que una foto no puede quedar marcada dos
 * veces en la misma selección.
 */
@Entity('fotos_seleccionadas')
export class FotoSeleccionada {
  @PrimaryColumn({ name: 'seleccion_id', type: 'uuid' })
  seleccionId: string;

  /** Referencia lógica a ms-media. */
  @PrimaryColumn({ name: 'foto_id', type: 'uuid' })
  fotoId: string;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @CreateDateColumn({ name: 'marcada_en', type: 'timestamptz' })
  marcadaEn: Date;

  @ManyToOne(() => Seleccion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seleccion_id' })
  seleccion: Seleccion;
}
