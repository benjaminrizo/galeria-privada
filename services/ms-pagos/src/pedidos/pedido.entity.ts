import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoDePedido {
  Pendiente = 'pendiente',
  Confirmado = 'confirmado',
}

const comoNumero = {
  to: (valor: number) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
};

/**
 * Agregado Pedido (docs/EventStorming/06-modelado-de-datos.md).
 *
 * No hay ningún campo de tarjeta ni de medio de pago: el pago es simulado y el
 * sistema nunca guarda esos datos (RNF-06).
 */
@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referencia lógica a ms-galerias. */
  @Index()
  @Column({ name: 'galeria_id', type: 'uuid' })
  galeriaId: string;

  @Column({ name: 'cantidad_fotos', type: 'int' })
  cantidadFotos: number;

  @Column({ name: 'precio_unitario', type: 'numeric', precision: 12, scale: 2, transformer: comoNumero })
  precioUnitario: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: comoNumero })
  total: number;

  @Column({ type: 'enum', enum: EstadoDePedido, default: EstadoDePedido.Pendiente })
  estado: EstadoDePedido;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @Column({ name: 'confirmado_en', type: 'timestamptz', nullable: true })
  confirmadoEn: Date | null;
}
