import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccesosService } from './accesos.service';
import { GenerarAccesoDto } from './dto';

@ApiTags('Accesos a galería')
@Controller('accesos')
export class AccesosController {
  constructor(private readonly servicio: AccesosService) {}

  @Post()
  @ApiOperation({ summary: 'A-AUTH-03 · GenerarEnlaceAcceso (HU-02)' })
  generar(@Body() datos: GenerarAccesoDto) {
    return this.servicio.generar(datos.galeriaId);
  }

  @Get()
  @ApiQuery({ name: 'galeriaId', type: String, description: 'UUID' })
  @ApiOperation({ summary: 'Q-AUTH-02 · ObtenerEnlaceDeGaleria (HU-02, HU-17)' })
  @ApiResponse({ status: 404, description: 'ACCESO_NO_ENCONTRADO' })
  porGaleria(@Query('galeriaId') galeriaId: string) {
    return this.servicio.porGaleria(galeriaId);
  }

  // Va después de @Get() para que la ruta sin parámetro no quede capturada aquí.
  @Get(':codigo')
  @ApiOperation({ summary: 'Q-AUTH-01 · ResolverCodigoDeAcceso (HU-03)' })
  @ApiResponse({ status: 404, description: 'ACCESO_NO_ENCONTRADO' })
  resolver(@Param('codigo') codigo: string) {
    return this.servicio.resolver(codigo);
  }
}
