import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuardarComentarioDto, MarcarFotoDto } from './dto';
import { SeleccionService } from './seleccion.service';

@ApiTags('Selección')
@Controller('galerias/:galeriaId/seleccion')
export class SeleccionController {
  constructor(private readonly servicio: SeleccionService) {}

  @Get()
  @ApiOperation({ summary: 'Q-SEL-01 · ObtenerSeleccion (HU-11, HU-12, HU-14, HU-16)' })
  obtener(@Param('galeriaId', ParseUUIDPipe) galeriaId: string) {
    return this.servicio.obtener(galeriaId);
  }

  @Put('fotos/:fotoId')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-SEL-01 · MarcarFoto (HU-10, HU-11, HU-12) · idempotente' })
  @ApiResponse({ status: 409, description: 'LIMITE_ALCANZADO · SELECCION_ENVIADA' })
  marcar(
    @Param('galeriaId', ParseUUIDPipe) galeriaId: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
    @Body() datos: MarcarFotoDto,
  ) {
    return this.servicio.marcar(galeriaId, fotoId, datos.limiteVigente);
  }

  @Delete('fotos/:fotoId')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-SEL-02 · DesmarcarFoto (HU-10)' })
  @ApiResponse({ status: 409, description: 'SELECCION_ENVIADA' })
  desmarcar(
    @Param('galeriaId', ParseUUIDPipe) galeriaId: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
  ) {
    return this.servicio.desmarcar(galeriaId, fotoId);
  }

  @Put('fotos/:fotoId/comentario')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-SEL-03 · GuardarComentario (HU-15)' })
  @ApiResponse({ status: 409, description: 'FOTO_NO_MARCADA · SELECCION_ENVIADA' })
  guardarComentario(
    @Param('galeriaId', ParseUUIDPipe) galeriaId: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
    @Body() datos: GuardarComentarioDto,
  ) {
    return this.servicio.guardarComentario(galeriaId, fotoId, datos.comentario);
  }

  @Post('envio')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-SEL-04 · EnviarSeleccion (HU-13)' })
  @ApiResponse({ status: 409, description: 'SELECCION_ENVIADA' })
  @ApiResponse({ status: 422, description: 'SELECCION_VACIA' })
  enviar(@Param('galeriaId', ParseUUIDPipe) galeriaId: string) {
    return this.servicio.enviar(galeriaId);
  }
}
