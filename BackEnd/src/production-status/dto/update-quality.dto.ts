import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQualityDto {
  @ApiProperty({ description: 'Chất lượng sản phẩm', enum: ['OK', 'NG'] })
  @IsEnum(['OK', 'NG'])
  quality: string;

  @ApiPropertyOptional({ description: 'Ghi chú', example: 'Đã kiểm tra chất lượng' })
  @IsOptional()
  @IsString()
  remark?: string;
}
