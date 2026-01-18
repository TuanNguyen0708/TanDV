import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStationDto {
  @ApiProperty({ example: 'ST01' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Khung gầm' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  sequence: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
