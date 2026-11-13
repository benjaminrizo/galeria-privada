import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';

/**
 * Este servicio no expone operaciones de negocio: reacciona a eventos. Lo único
 * que publica por HTTP es la consulta de diagnóstico (ms-notificaciones.md).
 */
@ApiTags('Notificaciones')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly servicio: NotificacionesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Q-NOT-01 · ConsultarEstadoDeNotificacion' })
  @ApiResponse({ status: 404, description: 'NOTIFICACION_NO_ENCONTRADA' })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtener(id);
  }
}
