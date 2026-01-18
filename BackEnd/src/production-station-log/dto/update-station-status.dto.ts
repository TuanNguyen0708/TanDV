import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { StationStatus } from '../entity/production-station-log.entity';

export class UpdateStationStatusDto {
  @ApiProperty({
    enum: StationStatus,
    example: StationStatus.RUNNING,
    required: false,
  })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;

  @ApiProperty({
    example: 'Chờ vật tư',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
