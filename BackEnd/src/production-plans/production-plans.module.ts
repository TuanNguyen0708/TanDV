import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionPlanController } from './production-plans.controller';
import { ProductionPlanService } from './production-plans.service';
import { ProductionMonthPlan } from './entity/production-month-plans.entity';
import { ProductionDailyPlans } from './entity/production-daily-plans.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionMonthPlan, ProductionDailyPlans]),
  ],
  controllers: [ProductionPlanController],
  providers: [ProductionPlanService],
  exports: [ProductionPlanService],
})
export class ProductionPlansModule {}
