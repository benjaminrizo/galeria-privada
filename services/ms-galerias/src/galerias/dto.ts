import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CrearGaleriaDto {
  @ApiProperty({ format: 'uuid', description: 'Lo entrega el gateway tras validar el token.' })
  @IsUUID('4')
  fotografoId: string;

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
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  fotografoId: string;

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

  @ApiPropertyOptional({
    example: 12,
    description: 'Fotos ya marcadas por el cliente; la consulta ms-seleccion y la trae el gateway.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidadMarcadas?: number;
}

export class PublicarGaleriaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  fotografoId: string;

  @ApiProperty({ example: 48, description: 'Fotos que ms-media reporta para esta galería.' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidadFotos: number;
}

export class DefinirPrecioDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  fotografoId: string;

  @ApiProperty({ example: 15000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio admite como máximo dos decimales.' })
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  precio: number;
}

export class AumentarLimiteDto {
  @ApiProperty({ example: 5, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que cero.' })
  cantidad: number;
}
