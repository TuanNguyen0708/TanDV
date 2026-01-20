import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductionPlansModule } from './production-plans/production-plans.module';
import { ProductionStatusModule } from './production-status/production-status.module';
import { StationModule } from './station/station.module';
import { StationDailyStatusModule } from './station-daily-status/station-daily-status.module';
import { StationDowntimeLogModule } from './station-downtime-log/station-downtime-log.module';
import { ModelModule } from './model/model.module';

@Module({
  imports: [
    DatabaseModule,
    ProductionPlansModule,
    ProductionStatusModule,
    StationModule,
    StationDailyStatusModule,
    StationDowntimeLogModule,
    ModelModule,
  ],
})
export class AppModule {}
