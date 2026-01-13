import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { QualityStatus } from '../entity/production.entity';

export class UpdateQualityDto {
  @ApiProperty({ enum: QualityStatus })
  @IsEnum(QualityStatus)
  qualityStatus: QualityStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
