import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClienteFlujo } from './cliente.flujo';
import { ComentarioDto, PedirFotosExtraDto } from './dto';

/**
 * API pública del cliente (G-12 a G-17).
 * No hay token: el `codigo` del enlace privado es la credencial (ADR 0001).
 */
@ApiTags('Cliente (enlace privado)')
@ApiResponse({ status: 404, description: 'GALERIA_NO_ENCONTRADA' })
@ApiResponse({ status: 403, description: 'GALERIA_NO_DISPONIBLE' })
@Controller('api/c/:codigo')
export class ClienteController {
  constructor(private readonly flujo: ClienteFlujo) {}

  @Get()
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiOperation({ summary: 'G-12 · Abrir galería (SEQ-07)' })
  abrir(@Param('codigo') codigo: string, @Query('pagina') pagina?: string) {
    return this.flujo.abrir(codigo, Number(pagina) || 1);
  }

  @Put('seleccion/fotos/:fotoId')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-13 · Marcar foto (SEQ-08)' })
  @ApiResponse({ status: 409, description: 'LIMITE_ALCANZADO · SELECCION_ENVIADA' })
  marcar(@Param('codigo') codigo: string, @Param('fotoId', ParseUUIDPipe) fotoId: string) {
    return this.flujo.marcar(codigo, fotoId);
  }

  @Delete('seleccion/fotos/:fotoId')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-14 · Desmarcar foto (SEQ-08)' })
  @ApiResponse({ status: 409, description: 'SELECCION_ENVIADA' })
  desmarcar(@Param('codigo') codigo: string, @Param('fotoId', ParseUUIDPipe) fotoId: string) {
    return this.flujo.desmarcar(codigo, fotoId);
  }

  @Put('seleccion/fotos/:fotoId/comentario')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-15 · Guardar comentario de retoque (SEQ-09)' })
  @ApiResponse({ status: 409, description: 'FOTO_NO_MARCADA · SELECCION_ENVIADA' })
  comentar(
    @Param('codigo') codigo: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
    @Body() datos: ComentarioDto,
  ) {
    return this.flujo.guardarComentario(codigo, fotoId, datos.comentario);
  }

  @Post('seleccion/envio')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-16 · Enviar selección (SEQ-10) · avisa al fotógrafo' })
  @ApiResponse({ status: 409, description: 'SELECCION_ENVIADA' })
  @ApiResponse({ status: 422, description: 'SELECCION_VACIA' })
  enviar(@Param('codigo') codigo: string) {
    return this.flujo.enviarSeleccion(codigo);
  }

  @Post('pedidos')
  @ApiOperation({ summary: 'G-17 · Pedir fotos extra con pago simulado (SEQ-12, extra)' })
  @ApiResponse({ status: 409, description: 'PRECIO_NO_DEFINIDO · SELECCION_ENVIADA' })
  pedirFotosExtra(@Param('codigo') codigo: string, @Body() datos: PedirFotosExtraDto) {
    return this.flujo.pedirFotosExtra(codigo, datos);
  }
}
