import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionMonthPlan } from '../production-plans/entity/production-month-plans.entity';
import { ProductionDailyPlans } from '../production-plans/entity/production-daily-plans.entity';
import { ProductionStatus } from '../production-status/entity/production-status.entity';
import { Station } from '../station/entity/station.entity';
import { StationDailyStatus } from '../station-daily-status/entity/station-daily-status.entity';
import { StationDowntimeLog } from '../station-downtime-log/entity/station-downtime-log.entity';
import { Model } from '../model/entity/model.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'nestjs_db',
      entities: [
        ProductionMonthPlan,
        ProductionDailyPlans,
        ProductionStatus,
        Station,
        StationDailyStatus,
        StationDowntimeLog,
        Model,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Auto sync schema in development
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
