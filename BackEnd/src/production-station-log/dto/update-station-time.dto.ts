import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateStationTimeDto {
  @ApiProperty({ example: '2026-01-13T08:40:00', required: false })
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @ApiProperty({ example: '2026-01-13T09:05:00', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
