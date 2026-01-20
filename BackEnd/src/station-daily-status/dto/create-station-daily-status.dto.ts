import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStationDailyStatusDto {
  @ApiProperty({ description: 'UUID của station', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  stationID: string;

  @ApiProperty({ description: 'Ngày ghi nhận trạng thái', example: '2024-01-20' })
  @IsDateString()
  statusDate: Date;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu làm việc', example: '08:00:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc làm việc', example: '17:00:00' })
  @IsOptional()
  @IsString()
  stopTime?: string;

  @ApiPropertyOptional({ description: 'Tổng thời gian downtime (phút)', example: 45 })
  @IsOptional()
  @IsNumber()
  totalDowntime?: number;
}
