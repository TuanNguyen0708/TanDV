import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, MaxLength } from 'class-validator';

export class CreateProductionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  productionNo: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  model: string;

  @ApiProperty({ example: '2026-01-13' })
  @IsDateString()
  productionDate: string;
}
