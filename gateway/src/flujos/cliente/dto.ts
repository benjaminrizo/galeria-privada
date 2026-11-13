import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, MaxLength } from 'class-validator';

export class ComentarioDto {
  @ApiProperty({ example: 'Aclarar un poco la piel y recortar el fondo de la derecha.' })
  @IsString()
  @MaxLength(1000, { message: 'El comentario admite como máximo 1000 caracteres.' })
  comentario: string;
}

export class PedirFotosExtraDto {
  @ApiProperty({ example: 3, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que cero.' })
  cantidad: number;
}
