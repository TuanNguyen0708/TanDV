import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { Station } from './entity/station.entity';
import { StationDailyStatus } from '../station-daily-status/entity/station-daily-status.entity';
import { StationDowntimeLog } from '../station-downtime-log/entity/station-downtime-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Station, StationDailyStatus, StationDowntimeLog]),
  ],
  controllers: [StationController],
  providers: [StationService],
  exports: [StationService],
})
export class StationModule {}
