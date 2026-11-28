import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { nombreDelServicio } from './arranque';
import { ErrorDeNegocio } from './errores';

/**
 * Liveness y readiness, separados a propósito (capítulo 9).
 *
 * `/ping` dice que el proceso está vivo. `/health` dice además que puede
 * trabajar, porque comprueba la base de datos. La diferencia importa: un
 * orquestador reinicia un contenedor que no responde a `/ping`, pero a uno que
 * falla `/health` solo deja de mandarle tráfico hasta que se recupere.
 */
@ApiTags('Salud')
@Controller()
export class SaludController {
  private readonly log = new Logger('Salud');

  constructor(@InjectDataSource() private readonly datos: DataSource) {}

  @Get('ping')
  @ApiOperation({ summary: 'Liveness · el proceso está vivo' })
  ping() {
    return { estado: 'vivo', servicio: nombreDelServicio, momento: new Date().toISOString() };
  }

  @Get('health')
  @ApiOperation({ summary: 'Readiness · además hay conexión a la base de datos' })
  @ApiResponse({ status: 200, description: 'Listo para recibir tráfico' })
  @ApiResponse({ status: 503, description: 'NO_LISTO · sin conexión a la base de datos' })
  async health() {
    try {
      await this.datos.query('SELECT 1');
    } catch (error) {
      this.log.warn(`La base de datos no responde: ${error}`);
      throw new ErrorDeNegocio(
        HttpStatus.SERVICE_UNAVAILABLE,
        'NO_LISTO',
        'El servicio está vivo pero no tiene conexión con su base de datos.',
      );
    }

    return { estado: 'listo', servicio: nombreDelServicio, postgres: 'conectado' };
  }
}
