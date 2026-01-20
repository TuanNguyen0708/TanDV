import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStationDowntimeLogDto {
  @ApiProperty({ description: 'UUID của station daily status', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  stationDailyID: string;

  @ApiPropertyOptional({ description: 'Mô tả lý do downtime', example: 'Bảo trì định kỳ' })
  @IsOptional()
  @IsString()
  downTimeLog?: string;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu downtime', example: '2024-01-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  downtimeStart?: Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc downtime', example: '2024-01-20T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  downtimeStop?: Date;
}
