import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Agregado Fotógrafo (docs/EventStorming/06-modelado-de-datos.md).
 * La contraseña solo se guarda con hash (RNF-03, HT-08).
 */
@Entity('fotografos')
export class Fotografo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', unique: true })
  correo: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
