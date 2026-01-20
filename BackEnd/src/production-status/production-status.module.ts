import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionStatusService } from './production-status.service';
import { ProductionStatusController } from './production-status.controller';
import { ProductionStatus } from './entity/production-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionStatus])],
  controllers: [ProductionStatusController],
  providers: [ProductionStatusService],
  exports: [ProductionStatusService],
})
export class ProductionStatusModule {}
