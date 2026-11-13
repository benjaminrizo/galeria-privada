import { CanActivate, ExecutionContext, Injectable, createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorDeNegocio } from '../comun/errores';

/**
 * HT-02: el gateway valida el token del fotógrafo y es el único que lo hace.
 * A los servicios les entrega ya el `fotografoId`, y ellos confían en ese dato
 * (docs/QueriesYActions/README.md).
 */
@Injectable()
export class FotografoGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const peticion = contexto.switchToHttp().getRequest();
    const cabecera: string = peticion.headers?.authorization || '';
    const [esquema, token] = cabecera.split(' ');

    if (esquema?.toLowerCase() !== 'bearer' || !token) {
      throw ErrorDeNegocio.noAutenticado('NO_AUTENTICADO', 'Falta el token de la sesión.');
    }

    try {
      const contenido = await this.jwt.verifyAsync(token);
      peticion.fotografoId = contenido.sub;
      peticion.fotografoCorreo = contenido.correo;
    } catch {
      throw ErrorDeNegocio.noAutenticado('NO_AUTENTICADO', 'La sesión no es válida o ya venció.');
    }

    return true;
  }
}

/** Inyecta el `fotografoId` que dejó el guard. */
export const FotografoId = createParamDecorator((_dato: unknown, contexto: ExecutionContext) => {
  return contexto.switchToHttp().getRequest().fotografoId as string;
});
