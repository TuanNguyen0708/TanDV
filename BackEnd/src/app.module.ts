import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductionPlansModule } from './production-plans/production-plans.module';

@Module({
  imports: [DatabaseModule, ProductionPlansModule],
})
export class AppModule {}
