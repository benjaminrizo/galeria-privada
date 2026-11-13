import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Notificacion, TipoDeNotificacion } from './notificacion.entity';

/**
 * Envío de los correos. En desarrollo apunta a Mailpit (docker-compose), que
 * los recoge en una bandeja web en lugar de mandarlos de verdad.
 */
@Injectable()
export class CorreoService {
  private readonly log = new Logger('Correo');
  private readonly remitente = process.env.CORREO_REMITENTE || 'Galería Privada <no-responder@galeria.local>';

  private readonly transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SEGURO === 'true',
    auth: process.env.SMTP_USUARIO
      ? { user: process.env.SMTP_USUARIO, pass: process.env.SMTP_PASSWORD }
      : undefined,
    // Los servidores de correo de prueba traen certificados firmados por ellos
    // mismos, que harían fallar el envío. Con un servidor real se deja en
    // estricto, que es lo que vale por defecto.
    tls: { rejectUnauthorized: process.env.SMTP_TLS_ESTRICTO !== 'false' },
  });

  async enviar(notificacion: Notificacion): Promise<void> {
    const { asunto, cuerpo } = this.redactar(notificacion);

    await this.transporte.sendMail({
      from: this.remitente,
      to: notificacion.destinatarioCorreo,
      subject: asunto,
      text: cuerpo,
    });

    this.log.log(`Correo "${asunto}" enviado a ${notificacion.destinatarioCorreo}`);
  }

  /** Los textos van en español, como el resto de la interfaz (RNF-11). */
  private redactar(notificacion: Notificacion): { asunto: string; cuerpo: string } {
    const datos = notificacion.contenido;

    if (notificacion.tipo === TipoDeNotificacion.GaleriaPublicada) {
      return {
        asunto: `Tus fotos ya están listas: ${datos.nombreGaleria}`,
        cuerpo:
          `Hola ${datos.clienteNombre}:\n\n` +
          `Ya puedes ver y elegir las fotos de "${datos.nombreGaleria}".\n\n` +
          `Entra con este enlace privado:\n${datos.enlace}\n\n` +
          `No necesitas crear ninguna cuenta. Cuando termines de elegir, envía tu selección ` +
          `desde la misma página.\n\n` +
          `Un saludo.`,
      };
    }

    return {
      asunto: `Selección recibida: ${datos.nombreGaleria}`,
      cuerpo:
        `Hola:\n\n` +
        `El cliente de "${datos.nombreGaleria}" ya envió su selección: ` +
        `${datos.cantidad} foto(s).\n\n` +
        `Entra a la galería para ver las fotos elegidas y sus comentarios de retoque.\n\n` +
        `Un saludo.`,
    };
  }
}
