import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ErrorDeNegocio } from '../comun/errores';
import { AccesoGaleria } from './acceso.entity';

/**
 * 24 bytes aleatorios en base64url dan 32 caracteres (192 bits). Adivinarlo por
 * fuerza bruta no es viable, que es lo que pide RNF-02 / HT-09.
 */
const BYTES_DEL_CODIGO = 24;

@Injectable()
export class AccesosService {
  private readonly log = new Logger('Accesos');

  constructor(
    @InjectRepository(AccesoGaleria)
    private readonly repositorio: Repository<AccesoGaleria>,
  ) {}

  /** A-AUTH-03 · GenerarEnlaceAcceso (HU-02) */
  async generar(galeriaId: string): Promise<{ codigo: string }> {
    // Cada galería tiene un acceso activo: si ya existe, se devuelve el mismo.
    // Así el flujo de crear galería (SEQ-02) puede reintentarse sin duplicar enlaces.
    const existente = await this.repositorio.findOneBy({ galeriaId, activo: true });
    if (existente) return { codigo: existente.codigo };

    const acceso = await this.repositorio.save(
      this.repositorio.create({ galeriaId, codigo: this.nuevoCodigo(), activo: true }),
    );

    // EV-05: EnlaceDeAccesoGenerado
    this.log.log(`Enlace generado para la galería ${galeriaId}`);
    return { codigo: acceso.codigo };
  }

  /** Q-AUTH-01 · ResolverCodigoDeAcceso (HU-03) */
  async resolver(codigo: string): Promise<{ galeriaId: string }> {
    const acceso = await this.repositorio.findOneBy({ codigo, activo: true });

    // El mismo error si no existe o está inactivo: no se revela nada de otras galerías.
    if (!acceso) {
      throw ErrorDeNegocio.noEncontrado('ACCESO_NO_ENCONTRADO', 'El enlace no existe o ya no está activo.');
    }

    return { galeriaId: acceso.galeriaId };
  }

  /** Q-AUTH-02 · ObtenerEnlaceDeGaleria (HU-02, HU-17) */
  async porGaleria(galeriaId: string): Promise<{ codigo: string }> {
    const acceso = await this.repositorio.findOneBy({ galeriaId, activo: true });

    if (!acceso) {
      throw ErrorDeNegocio.noEncontrado('ACCESO_NO_ENCONTRADO', 'Esa galería no tiene enlace de acceso.');
    }

    return { codigo: acceso.codigo };
  }

  /**
   * Reacción al evento `GaleriaEliminada`: borra el enlace de esa galería.
   * Es idempotente: borrar algo que ya no existe no es un error.
   */
  async borrarPorGaleria(galeriaId: string): Promise<void> {
    const { affected } = await this.repositorio.delete({ galeriaId });
    this.log.log(`Enlaces borrados de la galería ${galeriaId}: ${affected ?? 0}`);
  }

  private nuevoCodigo(): string {
    return randomBytes(BYTES_DEL_CODIGO).toString('base64url');
  }
}
