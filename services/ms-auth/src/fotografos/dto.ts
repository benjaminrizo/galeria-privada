import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegistrarFotografoDto {
  @ApiProperty({ example: 'Laura Gómez' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ example: 'laura@example.com' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido.' })
  correo: string;

  @ApiProperty({ example: 'unaClaveSegura', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(100)
  password: string;
}

export class IniciarSesionDto {
  @ApiProperty({ example: 'laura@example.com' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido.' })
  correo: string;

  @ApiProperty({ example: 'unaClaveSegura' })
  @IsString()
  @MinLength(1)
  password: string;
}
