import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoDeNotificacion {
  GaleriaPublicada = 'galeria_publicada',
  SeleccionEnviada = 'seleccion_enviada',
}

export enum EstadoDeNotificacion {
  Pendiente = 'pendiente',
  Enviada = 'enviada',
  Fallida = 'fallida',
}

/**
 * Agregado Notificación (docs/EventStorming/06-modelado-de-datos.md).
 *
 * `evento_id` es único: si el mismo evento llega dos veces, no se registra dos
 * veces ni se manda el correo dos veces (idempotencia, ms-notificaciones.md).
 */
@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** `id` del mensaje del broker que originó esta notificación. */
  @Index({ unique: true })
  @Column({ name: 'evento_id', type: 'uuid' })
  eventoId: string;

  @Column({ type: 'enum', enum: TipoDeNotificacion })
  tipo: TipoDeNotificacion;

  @Column({ name: 'destinatario_correo', type: 'text' })
  destinatarioCorreo: string;

  /** Datos ya completos para armar el correo; no hay que consultar a nadie. */
  @Column({ type: 'jsonb' })
  contenido: Record<string, any>;

  @Column({ type: 'enum', enum: EstadoDeNotificacion, default: EstadoDeNotificacion.Pendiente })
  estado: EstadoDeNotificacion;

  @Column({ type: 'int', default: 0 })
  intentos: number;

  @Column({ name: 'ultimo_error', type: 'text', nullable: true })
  ultimoError: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @Column({ name: 'enviado_en', type: 'timestamptz', nullable: true })
  enviadoEn: Date | null;
}
