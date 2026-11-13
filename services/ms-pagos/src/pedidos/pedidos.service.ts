import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorDeNegocio } from '../comun/errores';
import { CrearPedidoDto } from './dto';
import { EstadoDePedido, Pedido } from './pedido.entity';

@Injectable()
export class PedidosService {
  private readonly log = new Logger('Pedidos');

  constructor(
    @InjectRepository(Pedido)
    private readonly repositorio: Repository<Pedido>,
  ) {}

  /** A-PAG-01 · CrearPedido (HU-20) */
  async crear(datos: CrearPedidoDto) {
    // El total se calcula aquí y no se recibe de fuera, para que no llegue mal.
    const total = Number((datos.cantidadFotos * datos.precioUnitario).toFixed(2));

    const pedido = await this.repositorio.save(
      this.repositorio.create({
        galeriaId: datos.galeriaId,
        cantidadFotos: datos.cantidadFotos,
        precioUnitario: datos.precioUnitario,
        total,
        estado: EstadoDePedido.Pendiente,
      }),
    );

    // EV-24: PedidoCreado
    this.log.log(`Pedido creado: ${pedido.id} (${pedido.cantidadFotos} foto(s), total ${total})`);
    return { pedidoId: pedido.id, total: pedido.total, estado: pedido.estado };
  }

  /**
   * A-PAG-02 · ConfirmarPagoSimulado (HU-20).
   * Confirma el pedido sin cobrar nada: es el pago simulado del alcance.
   * Idempotente: confirmar dos veces deja el mismo resultado.
   */
  async confirmarPagoSimulado(id: string) {
    const pedido = await this.buscar(id);

    if (pedido.estado === EstadoDePedido.Pendiente) {
      pedido.estado = EstadoDePedido.Confirmado;
      pedido.confirmadoEn = new Date();
      await this.repositorio.save(pedido);
      // EV-25: PagoSimuladoConfirmado
      this.log.log(`Pago simulado confirmado para el pedido ${pedido.id}`);
    }

    return this.resumen(pedido);
  }

  /** Q-PAG-01 · ObtenerPedido (HU-20) */
  async obtener(id: string) {
    return this.resumen(await this.buscar(id));
  }

  private async buscar(id: string): Promise<Pedido> {
    const pedido = await this.repositorio.findOneBy({ id });

    if (!pedido) {
      throw ErrorDeNegocio.noEncontrado('PEDIDO_NO_ENCONTRADO', 'No existe ese pedido.');
    }

    return pedido;
  }

  private resumen(pedido: Pedido) {
    return {
      pedidoId: pedido.id,
      galeriaId: pedido.galeriaId,
      cantidadFotos: pedido.cantidadFotos,
      precioUnitario: pedido.precioUnitario,
      total: pedido.total,
      estado: pedido.estado,
      creadoEn: pedido.creadoEn,
      confirmadoEn: pedido.confirmadoEn,
    };
  }
}
