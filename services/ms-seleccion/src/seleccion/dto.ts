import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, MaxLength } from 'class-validator';

export class MarcarFotoDto {
  @ApiProperty({
    example: 20,
    description: 'Límite vigente (incluido + extra). Lo calcula el gateway consultando ms-galerias (HT-12).',
  })
  @Type(() => Number)
  @IsInt({ message: 'El límite vigente debe ser un número entero.' })
  @IsPositive({ message: 'El límite vigente debe ser mayor que cero.' })
  limiteVigente: number;
}

export class GuardarComentarioDto {
  @ApiProperty({ example: 'Aclarar un poco la piel y recortar el fondo de la derecha.' })
  @IsString()
  @MaxLength(1000, { message: 'El comentario admite como máximo 1000 caracteres.' })
  comentario: string;
}
