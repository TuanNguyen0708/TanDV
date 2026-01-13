import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionStationLogController } from './production-station-log.controller';
import { ProductionStationLogService } from './production-station-log.service';
import { ProductionStationLog } from './entity/production-station-log.entity';
import { ProductionModule } from '../production/production.module';
import { StationModule } from '../station/station.module';
import { Production } from '../production/entity/production.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionStationLog, Production]),
    ProductionModule,
    StationModule,
  ],
  controllers: [ProductionStationLogController],
  providers: [ProductionStationLogService],
})
export class ProductionStationLogModule {}
