import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ProductionDailyPlans } from './production-daily-plans.entity';

@Entity('production_month_plans')
@Unique(['model', 'planMonth'])
export class ProductionMonthPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  model: string;

  /**
   * Always store first day of month (YYYY-MM-01)
   */
  @Column({ type: 'date', name: 'plan_month' })
  planMonth: string;

  @Column({ type: 'int', name: 'planned_month' })
  plannedMonth: number;

  @OneToMany(() => ProductionDailyPlans, (dailyPlan) => dailyPlan.monthPlan)
  dailyPlans: ProductionDailyPlans[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
