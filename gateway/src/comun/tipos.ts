/**
 * Catálogo de eventos de integración.
 * Fuente: docs/QueriesYActions/eventos.md
 */

export const EXCHANGE_EVENTOS = 'galeria.eventos';
export const EXCHANGE_FALLIDOS = 'galeria.eventos.fallidos';

export const Eventos = {
  FotoSubida: 'FotoSubida',
  GaleriaEliminada: 'GaleriaEliminada',
  GaleriaPublicada: 'GaleriaPublicada',
  SeleccionEnviada: 'SeleccionEnviada',
} as const;

export type NombreDeEvento = (typeof Eventos)[keyof typeof Eventos];

/** Sobre común de todo mensaje del broker (ver eventos.md). */
export interface Mensaje<T = any> {
  evento: NombreDeEvento;
  /** Identificador único del mensaje; permite ignorar duplicados. */
  id: string;
  ocurrioEn: string;
  datos: T;
}

export interface DatosFotoSubida {
  fotoId: string;
  galeriaId: string;
}

export interface DatosGaleriaEliminada {
  galeriaId: string;
}

export interface DatosGaleriaPublicada {
  galeriaId: string;
  nombreGaleria: string;
  clienteNombre: string;
  clienteCorreo: string;
  enlace: string;
}

export interface DatosSeleccionEnviada {
  galeriaId: string;
  nombreGaleria: string;
  fotografoCorreo: string;
  cantidad: number;
}
