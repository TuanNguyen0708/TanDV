import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionStatusService } from './production-status.service';
import { ProductionStatusController } from './production-status.controller';
import { ProductionStatus } from './entity/production-status.entity';
import { ProductionDailyPlans } from '../production-plans/entity/production-daily-plans.entity';
import { ProductionMonthPlan } from '../production-plans/entity/production-month-plans.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionStatus,
      ProductionDailyPlans,
      ProductionMonthPlan,
    ]),
  ],
  controllers: [ProductionStatusController],
  providers: [ProductionStatusService],
  exports: [ProductionStatusService],
})
export class ProductionStatusModule {}
