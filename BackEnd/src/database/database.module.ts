import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionMonthPlan } from '../production-plans/entity/production-month-plans.entity';
import { ProductionDailyPlans } from '../production-plans/entity/production-daily-plans.entity';
import { Production } from '../production/entity/production.entity';
import { ProductionStationLog } from '../production-station-log/entity/production-station-log.entity';
import { Station } from '../station/entity/station.entity';

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
        Production,
        ProductionStationLog,
        Station,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Auto sync schema in development
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
