import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CrearPedidoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  galeriaId: string;

  @ApiProperty({ example: 5, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que cero.' })
  cantidadFotos: number;

  @ApiProperty({ example: 15000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio admite como máximo dos decimales.' })
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  precioUnitario: number;
}
