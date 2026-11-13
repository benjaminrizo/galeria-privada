import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Error de negocio con el formato acordado en docs/QueriesYActions/README.md:
 *   { "codigo": "CODIGO_DE_ERROR", "mensaje": "texto legible" }
 */
export class ErrorDeNegocio extends HttpException {
  constructor(estado: HttpStatus, codigo: string, mensaje: string) {
    super({ codigo, mensaje }, estado);
  }

  static datosInvalidos(mensaje: string) {
    return new ErrorDeNegocio(HttpStatus.UNPROCESSABLE_ENTITY, 'DATOS_INVALIDOS', mensaje);
  }

  /** 422 con un código propio, como `SIN_FOTOS` o `SELECCION_VACIA`. */
  static noProcesable(codigo: string, mensaje: string) {
    return new ErrorDeNegocio(HttpStatus.UNPROCESSABLE_ENTITY, codigo, mensaje);
  }

  static noEncontrado(codigo: string, mensaje: string) {
    return new ErrorDeNegocio(HttpStatus.NOT_FOUND, codigo, mensaje);
  }

  static conflicto(codigo: string, mensaje: string) {
    return new ErrorDeNegocio(HttpStatus.CONFLICT, codigo, mensaje);
  }

  static noAutenticado(codigo = 'NO_AUTENTICADO', mensaje = 'Falta la sesión o no es válida.') {
    return new ErrorDeNegocio(HttpStatus.UNAUTHORIZED, codigo, mensaje);
  }

  static prohibido(codigo: string, mensaje: string) {
    return new ErrorDeNegocio(HttpStatus.FORBIDDEN, codigo, mensaje);
  }

  static noDisponible(codigo = 'SERVICIO_NO_DISPONIBLE', mensaje = 'Servicio no disponible.') {
    return new ErrorDeNegocio(HttpStatus.SERVICE_UNAVAILABLE, codigo, mensaje);
  }
}

/**
 * Deja TODA respuesta de error con la misma forma, incluidas las que genera
 * NestJS por su cuenta (validación de DTOs, rutas inexistentes, etc.).
 */
@Catch()
export class FiltroDeErrores implements ExceptionFilter {
  private readonly log = new Logger('Error');

  catch(excepcion: unknown, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse();

    if (excepcion instanceof HttpException) {
      const estado = excepcion.getStatus();
      const cuerpo = excepcion.getResponse() as any;

      if (cuerpo && typeof cuerpo === 'object' && 'codigo' in cuerpo) {
        return respuesta.status(estado).json(cuerpo);
      }

      // Errores que no nacieron como ErrorDeNegocio: se traducen al formato común.
      const mensaje = Array.isArray(cuerpo?.message)
        ? cuerpo.message.join('. ')
        : cuerpo?.message || excepcion.message;

      return respuesta.status(estado).json({ codigo: codigoPorEstado(estado), mensaje });
    }

    this.log.error(excepcion instanceof Error ? excepcion.stack : String(excepcion));
    return respuesta.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      codigo: 'ERROR_INTERNO',
      mensaje: 'Ocurrió un error inesperado.',
    });
  }
}

function codigoPorEstado(estado: number): string {
  switch (estado) {
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'DATOS_INVALIDOS';
    case HttpStatus.UNAUTHORIZED:
      return 'NO_AUTENTICADO';
    case HttpStatus.FORBIDDEN:
      return 'PROHIBIDO';
    case HttpStatus.NOT_FOUND:
      return 'NO_ENCONTRADO';
    case HttpStatus.CONFLICT:
      return 'CONFLICTO';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'SERVICIO_NO_DISPONIBLE';
    default:
      return 'ERROR';
  }
}
