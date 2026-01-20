import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductionStatusDto {
  @ApiProperty({ description: 'Mã model xe', example: 'KL199' })
  @IsString()
  modelID: string;

  @ApiProperty({ description: 'Số xe', example: 'VEH-2024-001' })
  @IsString()
  vehicleID: string;

  @ApiProperty({ description: 'Ngày sản xuất', example: '2024-01-20' })
  @IsDateString()
  productionDate: Date;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu station', example: '2024-01-20T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  stationStart?: Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc station', example: '2024-01-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  stationEnd?: Date;

  @ApiPropertyOptional({ description: 'Chất lượng sản phẩm', enum: ['OK', 'NG'] })
  @IsOptional()
  @IsEnum(['OK', 'NG'])
  quality?: string;

  @ApiPropertyOptional({ description: 'Ghi chú', example: 'Đã kiểm tra chất lượng' })
  @IsOptional()
  @IsString()
  remark?: string;
}
