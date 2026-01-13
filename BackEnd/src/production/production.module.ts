import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { Production } from './entity/production.entity';
import { Station } from '../station/entity/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Production, Station])],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
