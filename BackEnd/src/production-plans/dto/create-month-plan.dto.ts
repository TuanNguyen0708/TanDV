import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Matches, MaxLength } from 'class-validator';

export class CreateMonthPlanDto {
  @ApiProperty({
    description: 'Model code (e.g., KL199)',
    example: 'KL199',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  model: string;

  @ApiProperty({
    description: 'Month in YYYY-MM format',
    example: '2026-01',
    type: String,
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Month must be in YYYY-MM format',
  })
  month: string;

  @ApiProperty({
    description: 'Planned production for the month',
    example: 3000,
    type: Number,
  })
  @IsNumber()
  plannedMonth: number;
}
