import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrearPedidoDto } from './dto';
import { PedidosService } from './pedidos.service';

@ApiTags('Pedidos (extra)')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly servicio: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'A-PAG-01 · CrearPedido (HU-20)' })
  @ApiResponse({ status: 422, description: 'DATOS_INVALIDOS' })
  crear(@Body() datos: CrearPedidoDto) {
    return this.servicio.crear(datos);
  }

  @Post(':id/pago-simulado')
  @HttpCode(200)
  @ApiOperation({ summary: 'A-PAG-02 · ConfirmarPagoSimulado (HU-20) · idempotente' })
  @ApiResponse({ status: 404, description: 'PEDIDO_NO_ENCONTRADO' })
  confirmar(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.confirmarPagoSimulado(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Q-PAG-01 · ObtenerPedido (HU-20)' })
  @ApiResponse({ status: 404, description: 'PEDIDO_NO_ENCONTRADO' })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtener(id);
  }
}
