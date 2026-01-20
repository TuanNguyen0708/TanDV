import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StationStatusCode } from '../../common/enums/station-status-code.enum';

export class CreateStationDto {
  @ApiProperty({ description: 'Tên station', example: 'Trạm lắp ráp khung gầm' })
  @IsString()
  stationName: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết station', example: 'Trạm lắp ráp khung gầm' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Station có đang hoạt động không', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Trạng thái hiện tại của station',
    enum: StationStatusCode,
    default: StationStatusCode.IDLE
  })
  @IsOptional()
  @IsEnum(StationStatusCode)
  currentStatusCode?: StationStatusCode;

  @ApiPropertyOptional({ description: 'Mô tả ngắn về trạng thái hiện tại', example: 'Đang bảo trì' })
  @IsOptional()
  @IsString()
  currentStatusBrief?: string;
}
