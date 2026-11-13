import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/** Comprobación rápida de que el gateway está en pie. */
@ApiTags('Estado')
@Controller('api/salud')
export class SaludController {
  @Get()
  @ApiOperation({ summary: 'Estado del gateway' })
  estado() {
    return { servicio: 'api-gateway', estado: 'ok', momento: new Date().toISOString() };
  }
}
