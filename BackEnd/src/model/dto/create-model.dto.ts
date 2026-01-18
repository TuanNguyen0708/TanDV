import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateModelDto {
  @ApiProperty({ example: 'KL199' })
  @IsString()
  @MaxLength(50)
  modelId: string;

  @ApiProperty({ example: 'Xe tải KL199' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Mô tả chi tiết về dòng xe KL199',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
