import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStationTimelineDto {
  @ApiProperty({ description: 'ID của trạm', example: 'station-uuid' })
  @IsString()
  stationID: string;

  @ApiPropertyOptional({ description: 'Tên trạm', example: 'Trạm lắp ráp' })
  @IsOptional()
  @IsString()
  stationName?: string;

  @ApiProperty({ 
    description: 'Thời gian bắt đầu (nếu không có sẽ dùng thời gian hiện tại)', 
    example: '2024-01-20T08:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startTime?: Date;
}
