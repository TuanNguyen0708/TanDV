import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductionPlansModule } from './production-plans/production-plans.module';
import { ProductionsModule } from './productions/productions.module';

@Module({
  imports: [DatabaseModule, ProductionPlansModule, ProductionsModule],
})
export class AppModule {}
