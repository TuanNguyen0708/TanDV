import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationDailyStatusService } from './station-daily-status.service';
import { StationDailyStatusController } from './station-daily-status.controller';
import { StationDailyStatus } from './entity/station-daily-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StationDailyStatus])],
  controllers: [StationDailyStatusController],
  providers: [StationDailyStatusService],
  exports: [StationDailyStatusService],
})
export class StationDailyStatusModule {}
