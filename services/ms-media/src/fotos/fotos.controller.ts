import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorDeNegocio } from '../comun/errores';
import { ArchivoSubido, FotosService } from './fotos.service';

/** Tope por archivo y por lote, para que una subida no agote la memoria. */
const MAX_ARCHIVOS = 50;
const MAX_BYTES = 25 * 1024 * 1024;

@ApiTags('Fotos')
@Controller()
export class FotosController {
  constructor(private readonly servicio: FotosService) {}

  @Post('galerias/:galeriaId/fotos')
  @HttpCode(202)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { archivos: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @ApiOperation({ summary: 'A-MED-01 · SubirFotos (HU-07) · procesamiento en segundo plano' })
  @UseInterceptors(
    FilesInterceptor('archivos', MAX_ARCHIVOS, { limits: { fileSize: MAX_BYTES } }),
  )
  subir(
    @Param('galeriaId', ParseUUIDPipe) galeriaId: string,
    @UploadedFiles() archivos: ArchivoSubido[],
  ) {
    return this.servicio.subir(galeriaId, archivos);
  }

  // Se declara antes de ':fotoId' para que "total" no se tome por un identificador.
  @Get('galerias/:galeriaId/fotos/total')
  @ApiOperation({ summary: 'Q-MED-01 · ContarFotos (HU-06)' })
  contar(@Param('galeriaId', ParseUUIDPipe) galeriaId: string) {
    return this.servicio.contar(galeriaId);
  }

  @Get('galerias/:galeriaId/fotos')
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiOperation({ summary: 'Q-MED-02 · ListarFotos (HU-08, HU-09) · solo miniaturas' })
  listar(
    @Param('galeriaId', ParseUUIDPipe) galeriaId: string,
    @Query('pagina') pagina?: string,
  ) {
    return this.servicio.listar(galeriaId, Number(pagina) || 1);
  }

  @Get('galerias/:galeriaId/fotos/:fotoId')
  @ApiOperation({ summary: 'Q-MED-03 · VerificarFotoDeGaleria (HU-10)' })
  @ApiResponse({ status: 404, description: 'FOTO_NO_ENCONTRADA' })
  verificar(
    @Param('galeriaId', ParseUUIDPipe) galeriaId: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
  ) {
    return this.servicio.verificar(galeriaId, fotoId);
  }

  @Get('fotos')
  @ApiQuery({ name: 'ids', description: 'Identificadores separados por coma.' })
  @ApiOperation({ summary: 'Q-MED-04 · ObtenerFotos (HU-14, HU-16) · incluye URL temporal del original' })
  porIds(@Query('ids') ids: string) {
    const lista = (ids || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (lista.length > 500) {
      throw ErrorDeNegocio.datosInvalidos('Demasiados identificadores en una sola consulta.');
    }

    return this.servicio.porIds(lista);
  }
}
