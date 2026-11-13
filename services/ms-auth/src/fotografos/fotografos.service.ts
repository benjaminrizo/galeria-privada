import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ErrorDeNegocio } from '../comun/errores';
import { IniciarSesionDto, RegistrarFotografoDto } from './dto';
import { Fotografo } from './fotografo.entity';

/** Coste del hash: suficiente para el proyecto sin frenar el login (HT-08). */
const RONDAS_DE_HASH = 10;

/**
 * Hash de una contraseña que nadie usa. Sirve para comparar también cuando el
 * correo no existe, de modo que el tiempo de respuesta no delate si la cuenta
 * está registrada o no.
 */
const HASH_SEÑUELO = bcrypt.hashSync('contraseña-que-nadie-usa', RONDAS_DE_HASH);

@Injectable()
export class FotografosService {
  private readonly log = new Logger('Fotografos');

  constructor(
    @InjectRepository(Fotografo)
    private readonly repositorio: Repository<Fotografo>,
    private readonly jwt: JwtService,
  ) {}

  /** A-AUTH-01 · RegistrarFotografo (HU-01) */
  async registrar(datos: RegistrarFotografoDto): Promise<{ fotografoId: string }> {
    const correo = datos.correo.trim().toLowerCase();

    if (await this.repositorio.existsBy({ correo })) {
      throw ErrorDeNegocio.conflicto('CORREO_DUPLICADO', 'Ya existe una cuenta con ese correo.');
    }

    const fotografo = await this.repositorio.save(
      this.repositorio.create({
        nombre: datos.nombre.trim(),
        correo,
        passwordHash: await bcrypt.hash(datos.password, RONDAS_DE_HASH),
      }),
    );

    // EV-01: FotografoRegistrado
    this.log.log(`Fotógrafo registrado: ${fotografo.id}`);
    return { fotografoId: fotografo.id };
  }

  /** A-AUTH-02 · IniciarSesion (HU-01) */
  async iniciarSesion(datos: IniciarSesionDto): Promise<{ token: string; fotografoId: string; nombre: string }> {
    const correo = datos.correo.trim().toLowerCase();
    const fotografo = await this.repositorio.findOneBy({ correo });

    // El mismo error en los dos casos: no se revela si falló el correo o la
    // contraseña (A-AUTH-02).
    const coincide = await bcrypt.compare(datos.password, fotografo?.passwordHash ?? HASH_SEÑUELO);

    if (!fotografo || !coincide) {
      // EV-03: IntentoDeAccesoFallido
      this.log.warn(`Intento de acceso fallido para ${correo}`);
      throw ErrorDeNegocio.noAutenticado('CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
    }

    // EV-02: SesionIniciada
    const token = await this.jwt.signAsync({ sub: fotografo.id, correo: fotografo.correo });
    return { token, fotografoId: fotografo.id, nombre: fotografo.nombre };
  }

  /** Q-AUTH-03 · ObtenerFotografo (HU-18) */
  async obtener(id: string): Promise<{ id: string; nombre: string; correo: string }> {
    const fotografo = await this.repositorio.findOneBy({ id });

    if (!fotografo) {
      throw ErrorDeNegocio.noEncontrado('FOTOGRAFO_NO_ENCONTRADO', 'No existe ese fotógrafo.');
    }

    return { id: fotografo.id, nombre: fotografo.nombre, correo: fotografo.correo };
  }
}
