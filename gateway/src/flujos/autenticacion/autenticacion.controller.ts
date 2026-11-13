import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClienteDeServicio } from '../../servicios/cliente-http';
import { AUTH } from '../../servicios/servicios.module';
import { LoginDto, RegistroDto } from '../galerias/dto';

/**
 * G-01 y G-02 (SEQ-01, petición directa): el gateway solo reenvía a ms-auth.
 * Son las dos únicas rutas del fotógrafo que no piden token.
 */
@ApiTags('Sesión del fotógrafo')
@Controller('api/auth')
export class AutenticacionController {
  constructor(@Inject(AUTH) private readonly auth: ClienteDeServicio) {}

  @Post('registro')
  @ApiOperation({ summary: 'G-01 · Registrar fotógrafo (SEQ-01)' })
  @ApiResponse({ status: 409, description: 'CORREO_DUPLICADO' })
  registro(@Body() datos: RegistroDto) {
    return this.auth.post('/fotografos', datos);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'G-02 · Iniciar sesión (SEQ-01)' })
  @ApiResponse({ status: 401, description: 'CREDENCIALES_INVALIDAS' })
  login(@Body() datos: LoginDto) {
    return this.auth.post('/login', datos);
  }
}
