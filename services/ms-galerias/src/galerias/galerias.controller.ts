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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AumentarLimiteDto,
  CrearGaleriaDto,
  DefinirPrecioDto,
  EditarGaleriaDto,
  PublicarGaleriaDto,
} from './dto';
import { GaleriasService } from './galerias.service';

@ApiTags('Galerías')
@Controller('galerias')
export class GaleriasController {
  constructor(private readonly servicio: GaleriasService) {}

  @Post()
  @ApiOperation({ summary: 'A-GAL-01 · CrearGaleria (HU-04)' })
  @ApiResponse({ status: 422, description: 'DATOS_INVALIDOS' })
  crear(@Body() datos: CrearGaleriaDto) {
    return this.servicio.crear(datos);
  }

  @Get()
  @ApiQuery({ name: 'fotografoId', type: String, description: 'UUID' })
  @ApiOperation({ summary: 'Q-GAL-01 · ListarGaleriasDeFotografo (HU-04, HU-05)' })
  listar(@Query('fotografoId', ParseUUIDPipe) fotografoId: string) {
    return this.servicio.listar(fotografoId);
  }

  @Get(':id')
  @ApiQuery({ name: 'fotografoId', required: false, type: String, description: 'UUID' })
  @ApiOperation({ summary: 'Q-GAL-02 · ObtenerGaleria (HU-03, HU-11)' })
  @ApiResponse({ status: 404, description: 'GALERIA_NO_ENCONTRADA' })
  obtener(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fotografoId') fotografoId?: string,
  ) {
    return this.servicio.obtener(id, fotografoId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'A-GAL-02 · EditarGaleria (HU-05)' })
  @ApiResponse({ status: 409, description: 'LIMITE_MENOR_A_SELECCION' })
  editar(@Param('id', ParseUUIDPipe) id: string, @Body() datos: EditarGaleriaDto) {
    return this.servicio.editar(id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiQuery({ name: 'fotografoId', type: String, description: 'UUID' })
  @ApiOperation({ summary: 'A-GAL-03 · EliminarGaleria (HU-05) · publica GaleriaEliminada' })
  eliminar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fotografoId', ParseUUIDPipe) fotografoId: string,
  ) {
    return this.servicio.eliminar(id, fotografoId);
  }

  @Post(':id/publicacion')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-GAL-04 · PublicarGaleria (HU-06)' })
  @ApiResponse({ status: 409, description: 'ESTADO_INVALIDO' })
  @ApiResponse({ status: 422, description: 'SIN_FOTOS' })
  publicar(@Param('id', ParseUUIDPipe) id: string, @Body() datos: PublicarGaleriaDto) {
    return this.servicio.publicar(id, datos);
  }

  @Post(':id/seleccion-enviada')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-GAL-05 · MarcarSeleccionEnviada (HU-06, HU-13) · idempotente' })
  marcarSeleccionEnviada(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.marcarSeleccionEnviada(id);
  }

  @Put(':id/precio-foto-extra')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-GAL-06 · DefinirPrecioFotoExtra (HU-19, extra)' })
  definirPrecio(@Param('id', ParseUUIDPipe) id: string, @Body() datos: DefinirPrecioDto) {
    return this.servicio.definirPrecio(id, datos);
  }

  @Post(':id/limite-extra')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-GAL-07 · AumentarLimite (HU-20, extra)' })
  aumentarLimite(@Param('id', ParseUUIDPipe) id: string, @Body() datos: AumentarLimiteDto) {
    return this.servicio.aumentarLimite(id, datos);
  }
}
