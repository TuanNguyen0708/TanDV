import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductionPlanService } from './production-plans.service';
import { CreateMonthPlanDto } from './dto/create-month-plan.dto';
import { CreateDailyResultDto } from './dto/create-daily-plan.dto';

@ApiTags('production-plans')
@Controller('production-plan')
export class ProductionPlanController {
  constructor(private readonly service: ProductionPlanService) {}

  @Post('month')
  @ApiOperation({
    summary: 'Create or update monthly production plan',
    description: 'Creates a new monthly production plan or updates an existing one for a specific model and month',
  })
  @ApiBody({ type: CreateMonthPlanDto })
  @ApiResponse({
    status: 201,
    description: 'Monthly plan created/updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        model: 'KL199',
        planMonth: '2026-01-01',
        plannedMonth: 3000,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  upsertMonth(@Body() dto: CreateMonthPlanDto) {
    return this.service.upsertMonthPlan(dto);
  }

  @Post('day')
  @ApiOperation({
    summary: 'Create or update daily production result',
    description: 'Creates a new daily production result or updates an existing one for a specific model and date',
  })
  @ApiBody({ type: CreateDailyResultDto })
  @ApiResponse({
    status: 201,
    description: 'Daily result created/updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        model: 'KL199',
        workDate: '2026-01-12',
        plannedDay: 100,
        actualDay: 95,
        createdAt: '2026-01-12T00:00:00.000Z',
        updatedAt: '2026-01-12T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  upsertDay(@Body() dto: CreateDailyResultDto) {
    return this.service.upsertDailyResult(dto);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get daily production summary',
    description: 'Retrieves a summary of production data for all models on a specific date, including planned/actual daily values, monthly plan, and cumulative production',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2026-01-12',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Daily summary retrieved successfully',
    schema: {
      example: {
        date: '2026-01-12',
        rows: [
          {
            model: 'KL199',
            plannedDay: 100,
            actualDay: 95,
            plannedMonth: 3000,
            cumulative: 285,
          },
        ],
        total: {
          plannedDay: 100,
          actualDay: 95,
          plannedMonth: 3000,
          cumulative: 285,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid date format' })
  getSummary(@Query('date') date: string) {
    return this.service.getDailySummary(date);
  }
}
