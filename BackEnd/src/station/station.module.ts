import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationController } from './station.controller';
import { StationService } from './station.service';
import { Station } from './entity/station.entity';
import { ProductionStationLog } from '../production-station-log/entity/production-station-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, ProductionStationLog])],
  controllers: [StationController],
  providers: [StationService],
  exports: [StationService],
})
export class StationModule {}
