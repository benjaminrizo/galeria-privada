import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IniciarSesionDto, RegistrarFotografoDto } from './dto';
import { FotografosService } from './fotografos.service';

@ApiTags('Fotógrafos')
@Controller()
export class FotografosController {
  constructor(private readonly servicio: FotografosService) {}

  @Post('fotografos')
  @ApiOperation({ summary: 'A-AUTH-01 · RegistrarFotografo (HU-01)' })
  @ApiResponse({ status: 201, description: 'Cuenta creada.' })
  @ApiResponse({ status: 409, description: 'CORREO_DUPLICADO' })
  @ApiResponse({ status: 422, description: 'DATOS_INVALIDOS' })
  registrar(@Body() datos: RegistrarFotografoDto) {
    return this.servicio.registrar(datos);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-AUTH-02 · IniciarSesion (HU-01)' })
  @ApiResponse({ status: 200, description: 'Token firmado.' })
  @ApiResponse({ status: 401, description: 'CREDENCIALES_INVALIDAS' })
  iniciarSesion(@Body() datos: IniciarSesionDto) {
    return this.servicio.iniciarSesion(datos);
  }

  @Get('fotografos/:id')
  @ApiOperation({ summary: 'Q-AUTH-03 · ObtenerFotografo (HU-18)' })
  @ApiResponse({ status: 404, description: 'FOTOGRAFO_NO_ENCONTRADO' })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtener(id);
  }
}
