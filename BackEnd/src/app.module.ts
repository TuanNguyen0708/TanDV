import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductionPlansModule } from './production-plans/production-plans.module';
import { ProductionModule } from './production/production.module';
import { StationModule } from './station/station.module';
import { ProductionStationLogModule } from './production-station-log/production-station-log.module';

@Module({
  imports: [
    DatabaseModule,
    ProductionPlansModule,
    ProductionModule,
    StationModule,
    ProductionStationLogModule,
  ],
})
export class AppModule {}
