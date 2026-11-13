import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoDeGaleria {
  Borrador = 'borrador',
  Publicada = 'publicada',
  SeleccionEnviada = 'seleccion_enviada',
}

/** Convierte el `numeric` de PostgreSQL en número de JavaScript. */
const comoNumero = {
  to: (valor: number | null) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
};

/**
 * Agregado Galería (docs/EventStorming/06-modelado-de-datos.md).
 * Una galería es lo mismo que una sesión fotográfica (glosario).
 */
@Entity('galerias')
export class Galeria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referencia lógica a ms-auth, sin clave foránea (RNF-15). */
  @Index()
  @Column({ name: 'fotografo_id', type: 'uuid' })
  fotografoId: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ name: 'cliente_nombre', type: 'text' })
  clienteNombre: string;

  @Column({ name: 'cliente_correo', type: 'text' })
  clienteCorreo: string;

  /** Fotos que incluye el paquete contratado. Mayor que cero. */
  @Column({ name: 'limite_incluido', type: 'int' })
  limiteIncluido: number;

  /** Fotos extra compradas. Sube al confirmar un pedido (A-GAL-07). */
  @Column({ name: 'limite_extra', type: 'int', default: 0 })
  limiteExtra: number;

  @Column({
    name: 'precio_foto_extra',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: comoNumero,
  })
  precioFotoExtra: number | null;

  @Column({ type: 'enum', enum: EstadoDeGaleria, default: EstadoDeGaleria.Borrador })
  estado: EstadoDeGaleria;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @Column({ name: 'publicada_en', type: 'timestamptz', nullable: true })
  publicadaEn: Date | null;
}

/** Límite vigente = incluido + extra (modelo de datos, paso 6). */
export function limiteVigente(galeria: Galeria): number {
  return galeria.limiteIncluido + galeria.limiteExtra;
}
