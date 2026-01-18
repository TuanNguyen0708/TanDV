import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateDailyResultDto {
  @ApiProperty({
    description: 'Model code (e.g., KL199)',
    example: 'KL199',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  model: string;

  @ApiProperty({
    description: 'Work date in YYYY-MM-DD format',
    example: '2026-01-12',
    type: String,
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    description: 'Planned production for the day',
    example: 100,
    type: Number,
  })
  @IsNumber()
  plannedDay: number;

  @ApiProperty({
    description: 'Actual production for the day (optional)',
    example: 95,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  actualDay?: number;

  @ApiProperty({
    description: 'Month plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsString()
  @IsUUID()
  monthPlanId: string;
}
