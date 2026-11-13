import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FotografoGuard, FotografoId } from '../../autenticacion/fotografo.guard';
import { CrearGaleriaDto, DefinirPrecioDto, EditarGaleriaDto } from './dto';
import { GaleriasFlujo } from './galerias.flujo';

const MAX_ARCHIVOS = 50;
const MAX_BYTES = 25 * 1024 * 1024;

/** API pública del fotógrafo (G-03 a G-11). Todas requieren token válido. */
@ApiTags('Fotógrafo')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'NO_AUTENTICADO' })
@UseGuards(FotografoGuard)
@Controller('api/galerias')
export class GaleriasController {
  constructor(private readonly flujo: GaleriasFlujo) {}

  @Get()
  @ApiOperation({ summary: 'G-03 · Listar mis galerías' })
  listar(@FotografoId() fotografoId: string) {
    return this.flujo.listar(fotografoId);
  }

  @Post()
  @ApiOperation({ summary: 'G-04 · Crear galería (SEQ-02) · crea la galería y su enlace' })
  crear(@FotografoId() fotografoId: string, @Body() datos: CrearGaleriaDto) {
    return this.flujo.crear(fotografoId, datos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'G-05 · Ver detalle de galería' })
  @ApiResponse({ status: 404, description: 'GALERIA_NO_ENCONTRADA' })
  detalle(@FotografoId() fotografoId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.flujo.detalle(fotografoId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'G-06 · Editar galería (SEQ-03)' })
  @ApiResponse({ status: 409, description: 'LIMITE_MENOR_A_SELECCION' })
  editar(
    @FotografoId() fotografoId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: EditarGaleriaDto,
  ) {
    return this.flujo.editar(fotografoId, id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'G-07 · Eliminar galería (SEQ-04)' })
  eliminar(@FotografoId() fotografoId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.flujo.eliminar(fotografoId, id);
  }

  @Post(':id/fotos')
  @HttpCode(202)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { archivos: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @ApiOperation({ summary: 'G-08 · Subir fotos (SEQ-05) · miniaturas en segundo plano' })
  @UseInterceptors(FilesInterceptor('archivos', MAX_ARCHIVOS, { limits: { fileSize: MAX_BYTES } }))
  subirFotos(
    @FotografoId() fotografoId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() archivos: any[],
  ) {
    return this.flujo.subirFotos(fotografoId, id, archivos);
  }

  @Post(':id/publicacion')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-09 · Publicar galería (SEQ-06) · avisa al cliente por correo' })
  @ApiResponse({ status: 409, description: 'ESTADO_INVALIDO' })
  @ApiResponse({ status: 422, description: 'SIN_FOTOS' })
  publicar(@FotografoId() fotografoId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.flujo.publicar(fotografoId, id);
  }

  @Get(':id/seleccion')
  @ApiOperation({ summary: 'G-10 · Ver selección enviada (SEQ-11)' })
  verSeleccion(@FotografoId() fotografoId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.flujo.verSeleccion(fotografoId, id);
  }

  @Put(':id/precio-foto-extra')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-11 · Definir precio de foto extra (extra)' })
  definirPrecio(
    @FotografoId() fotografoId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: DefinirPrecioDto,
  ) {
    return this.flujo.definirPrecio(fotografoId, id, datos);
  }
}
