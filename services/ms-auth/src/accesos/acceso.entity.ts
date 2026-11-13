import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Agregado Acceso a Galería: el enlace privado con el que entra el cliente
 * (ADR 0001). `galeria_id` es una referencia lógica a ms-galerias, sin clave
 * foránea, porque cada servicio es dueño de sus datos (RNF-15).
 */
@Entity('accesos_galeria')
export class AccesoGaleria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'galeria_id', type: 'uuid' })
  galeriaId: string;

  /** Código aleatorio, largo y único (RNF-02, HT-09). */
  @Column({ type: 'text', unique: true })
  codigo: string;

  /** Permite revocar o regenerar el enlace sin borrar el histórico. */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
