import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationDowntimeLogService } from './station-downtime-log.service';
import { StationDowntimeLogController } from './station-downtime-log.controller';
import { StationDowntimeLog } from './entity/station-downtime-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StationDowntimeLog])],
  controllers: [StationDowntimeLogController],
  providers: [StationDowntimeLogService],
  exports: [StationDowntimeLogService],
})
export class StationDowntimeLogModule {}
