import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FiltroDeErrores } from './errores';

interface Opciones {
  nombre: string;
  descripcion: string;
  puerto: number;
  /** Añade el esquema de token al contrato (solo el gateway lo necesita). */
  conToken?: boolean;
}

/**
 * Arranque común a todos los servicios: validación de entrada, formato único de
 * errores y contrato OpenAPI publicado en `/docs` (RNF-13, HT-04).
 */
/** Nombre del servicio, para que los endpoints de salud digan quién responde. */
export let nombreDelServicio = '';

export async function arrancar(moduloRaiz: any, opciones: Opciones) {
  nombreDelServicio = opciones.nombre;
  const app = await NestFactory.create(moduloRaiz, { cors: true });
  const log = new Logger(opciones.nombre);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // 422 es el código acordado para datos inválidos (QueriesYActions/README.md).
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalFilters(new FiltroDeErrores());
  app.enableShutdownHooks();

  const constructor = new DocumentBuilder()
    .setTitle(opciones.nombre)
    .setDescription(opciones.descripcion)
    .setVersion('1.0');
  if (opciones.conToken) constructor.addBearerAuth();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, constructor.build()));

  await app.listen(opciones.puerto, '0.0.0.0');
  log.log(`Escuchando en el puerto ${opciones.puerto} · contrato en /docs`);
  return app;
}
