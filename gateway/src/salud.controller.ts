import { Controller, Get, HttpStatus, Inject, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { nombreDelServicio } from './comun/arranque';
import { ErrorDeNegocio } from './comun/errores';
import { ClienteDeServicio } from './servicios/cliente-http';
import { AUTH, GALERIAS, MEDIA, PAGOS, SELECCION } from './servicios/servicios.module';

/**
 * Liveness y readiness del gateway (capítulo 9).
 *
 * Para el gateway «estar listo» no es solo estar vivo: no sirve de nada que
 * acepte peticiones si no puede alcanzar los servicios a los que orquesta. Por
 * eso `/health` consulta el `/ping` de los servicios del MVP. Los de prioridad
 * posterior (notificaciones, pagos) se informan pero no tumban la respuesta:
 * que falle el correo no deja al sistema inservible.
 */
@ApiTags('Salud')
@Controller()
export class SaludController {
  private readonly log = new Logger('Salud');

  constructor(
    @Inject(AUTH) private readonly auth: ClienteDeServicio,
    @Inject(GALERIAS) private readonly galerias: ClienteDeServicio,
    @Inject(MEDIA) private readonly media: ClienteDeServicio,
    @Inject(SELECCION) private readonly seleccion: ClienteDeServicio,
    @Inject(PAGOS) private readonly pagos: ClienteDeServicio,
  ) {}

  @Get('ping')
  @ApiOperation({ summary: 'Liveness · el gateway está vivo' })
  ping() {
    return { estado: 'vivo', servicio: nombreDelServicio, momento: new Date().toISOString() };
  }

  @Get('health')
  @ApiOperation({ summary: 'Readiness · además alcanza a los servicios del MVP' })
  @ApiResponse({ status: 200, description: 'Listo para recibir tráfico' })
  @ApiResponse({ status: 503, description: 'NO_LISTO · algún servicio del MVP no responde' })
  async health() {
    const criticos = [
      ['ms-auth', this.auth],
      ['ms-galerias', this.galerias],
      ['ms-media', this.media],
      ['ms-seleccion', this.seleccion],
    ] as const;

    const opcionales = [['ms-pagos', this.pagos]] as const;

    const revisar = async ([nombre, cliente]: readonly [string, ClienteDeServicio]) => {
      try {
        await cliente.get('/ping');
        return [nombre, 'ok'] as const;
      } catch {
        this.log.warn(`${nombre} no responde a /ping`);
        return [nombre, 'sin respuesta'] as const;
      }
    };

    // En paralelo: así la comprobación tarda lo que el más lento, no la suma.
    const [resultadoCriticos, resultadoOpcionales] = await Promise.all([
      Promise.all(criticos.map(revisar)),
      Promise.all(opcionales.map(revisar)),
    ]);

    const servicios = Object.fromEntries([...resultadoCriticos, ...resultadoOpcionales]);
    const caidos = resultadoCriticos.filter(([, estado]) => estado !== 'ok').map(([n]) => n);

    if (caidos.length > 0) {
      throw new ErrorDeNegocio(
        HttpStatus.SERVICE_UNAVAILABLE,
        'NO_LISTO',
        `No se alcanzan servicios del MVP: ${caidos.join(', ')}.`,
      );
    }

    return { estado: 'listo', servicio: nombreDelServicio, servicios };
  }

  /** Se mantiene la ruta anterior para no romper lo que ya la usaba. */
  @Get('api/salud')
  @ApiOperation({ summary: 'Estado del gateway (ruta histórica)' })
  estado() {
    return { servicio: 'api-gateway', estado: 'ok', momento: new Date().toISOString() };
  }
}
