import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductionStatusDto {
  @ApiProperty({ description: 'Mã model xe', example: 'KL199' })
  @IsString()
  modelID: string;

  @ApiProperty({ description: 'Số xe (unique)', example: 'VEH-2024-001' })
  @IsString()
  vehicleID: string;

  @ApiProperty({ description: 'Ngày sản xuất', example: '2024-01-20' })
  @IsDateString()
  productionDate: Date;

  @ApiPropertyOptional({ description: 'Ghi chú', example: 'Ghi chú khi tạo mới' })
  @IsOptional()
  @IsString()
  remark?: string;
}
