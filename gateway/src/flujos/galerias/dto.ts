import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Entradas de la API pública (gateway.md). El `fotografoId` no viaja en el
 * cuerpo: lo deduce el gateway del token.
 */
export class CrearGaleriaDto {
  @ApiProperty({ example: 'Sesión de grado · Laura' })
  @IsString()
  @MinLength(1, { message: 'El nombre de la galería no puede estar vacío.' })
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Laura Gómez' })
  @IsString()
  @MinLength(1, { message: 'El nombre del cliente no puede estar vacío.' })
  @MaxLength(120)
  clienteNombre: string;

  @ApiProperty({ example: 'laura@example.com' })
  @IsEmail({}, { message: 'El correo del cliente no tiene un formato válido.' })
  clienteCorreo: string;

  @ApiProperty({ example: 20, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @IsPositive({ message: 'El límite debe ser mayor que cero.' })
  limiteIncluido: number;
}

export class EditarGaleriaDto {
  @ApiPropertyOptional({ example: 'Sesión de grado · Laura (final)' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre de la galería no puede estar vacío.' })
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 25, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @IsPositive({ message: 'El límite debe ser mayor que cero.' })
  limiteIncluido?: number;
}

export class DefinirPrecioDto {
  @ApiProperty({ example: 15000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio admite como máximo dos decimales.' })
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  precio: number;
}

export class RegistroDto {
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

export class LoginDto {
  @ApiProperty({ example: 'laura@example.com' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido.' })
  correo: string;

  @ApiProperty({ example: 'unaClaveSegura' })
  @IsString()
  @MinLength(1)
  password: string;
}
