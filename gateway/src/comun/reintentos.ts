import { Logger } from '@nestjs/common';

const log = new Logger('Reintentos');

/**
 * Reintenta un paso de orquestación que debe completarse.
 *
 * Los flujos SEQ-10 y SEQ-12 lo necesitan: cuando el paso que cierra el flujo
 * falla, el gateway reintenta en lugar de dejar el sistema a medias.
 */
export async function reintentar<T>(
  descripcion: string,
  trabajo: () => Promise<T>,
  intentos = 3,
  esperaMs = 400,
): Promise<T> {
  let ultimoError: any;

  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await trabajo();
    } catch (error: any) {
      ultimoError = error;

      // Un error de negocio (datos inválidos, estado incorrecto) no se arregla
      // repitiendo la llamada: solo se reintenta cuando el servicio no responde.
      const estado = typeof error?.getStatus === 'function' ? error.getStatus() : 0;
      if (estado && estado < 500) throw error;

      if (intento < intentos) {
        log.warn(`${descripcion}: intento ${intento} falló (${error.message}); se repite.`);
        await new Promise((r) => setTimeout(r, esperaMs * intento));
      }
    }
  }

  log.error(`${descripcion}: agotados los ${intentos} intentos.`);
  throw ultimoError;
}
