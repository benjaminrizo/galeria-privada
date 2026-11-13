import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ErrorDeNegocio } from '../comun/errores';

/**
 * Cliente HTTP hacia un microservicio.
 *
 * Los servicios solo reciben llamadas del gateway (ADR 0002). Cuando uno
 * responde un error de negocio, se reenvía tal cual (mismo código HTTP y mismo
 * `codigo`), para que el frontend vea siempre el contrato de gateway.md.
 */
export class ClienteDeServicio {
  private readonly log: Logger;
  private readonly http: AxiosInstance;

  constructor(
    private readonly nombre: string,
    urlBase: string,
    milisegundos = Number(process.env.TIMEOUT_SERVICIOS_MS || 15000),
  ) {
    this.log = new Logger(`→ ${nombre}`);
    this.http = axios.create({
      baseURL: urlBase,
      timeout: milisegundos,
      // Los códigos de error los traduce este cliente, no axios.
      validateStatus: () => true,
    });
  }

  get<T>(ruta: string, parametros?: Record<string, any>) {
    return this.pedir<T>('GET', ruta, undefined, parametros);
  }

  post<T>(ruta: string, cuerpo?: any, parametros?: Record<string, any>) {
    return this.pedir<T>('POST', ruta, cuerpo, parametros);
  }

  patch<T>(ruta: string, cuerpo?: any) {
    return this.pedir<T>('PATCH', ruta, cuerpo);
  }

  put<T>(ruta: string, cuerpo?: any) {
    return this.pedir<T>('PUT', ruta, cuerpo);
  }

  borrar<T>(ruta: string, parametros?: Record<string, any>) {
    return this.pedir<T>('DELETE', ruta, undefined, parametros);
  }

  /** Envío de archivos (multipart) hacia ms-media. */
  async enviarFormulario<T>(ruta: string, formulario: any): Promise<T> {
    return this.pedir<T>('POST', ruta, formulario, undefined, formulario.getHeaders?.());
  }

  private async pedir<T>(
    metodo: string,
    ruta: string,
    cuerpo?: any,
    parametros?: Record<string, any>,
    cabeceras?: Record<string, string>,
  ): Promise<T> {
    let respuesta;

    try {
      respuesta = await this.http.request({
        method: metodo,
        url: ruta,
        data: cuerpo,
        params: parametros,
        headers: cabeceras,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
    } catch (error: any) {
      // Aquí solo llegan fallos de red o de tiempo de espera: el servicio está caído.
      this.log.error(`${metodo} ${ruta} sin respuesta: ${error.message}`);
      throw ErrorDeNegocio.noDisponible(
        'SERVICIO_NO_DISPONIBLE',
        `El servicio ${this.nombre} no está disponible en este momento.`,
      );
    }

    if (respuesta.status >= 400) {
      const cuerpoError = respuesta.data || {};
      this.log.warn(`${metodo} ${ruta} respondió ${respuesta.status} ${cuerpoError.codigo || ''}`);

      throw new ErrorDeNegocio(
        respuesta.status,
        cuerpoError.codigo || 'ERROR',
        cuerpoError.mensaje || `Error en el servicio ${this.nombre}.`,
      );
    }

    return respuesta.data as T;
  }
}
