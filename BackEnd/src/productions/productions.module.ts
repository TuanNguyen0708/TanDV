import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionsController } from './productions.controller';
import { ProductionsService } from './productions.service';
import { Production } from './entity/production.entity';
import { Station } from './entity/station.entity';
import { ProductionStationLog } from './entity/production-station-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Production, Station, ProductionStationLog]),
  ],
  controllers: [ProductionsController],
  providers: [ProductionsService],
})
export class ProductionsModule {}
