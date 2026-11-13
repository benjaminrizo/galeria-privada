import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerarAccesoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'galeriaId debe ser un UUID.' })
  galeriaId: string;
}
