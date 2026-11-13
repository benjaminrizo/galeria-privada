import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { Pedido } from './pedidos/pedido.entity';
import { PedidosController } from './pedidos/pedidos.controller';
import { PedidosService } from './pedidos/pedidos.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Pedido])),
    TypeOrmModule.forFeature([Pedido]),
    // Este servicio no publica ni consume eventos de integración: el gateway
    // orquesta el flujo del pedido extra (SEQ-12).
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class AppModule {}
