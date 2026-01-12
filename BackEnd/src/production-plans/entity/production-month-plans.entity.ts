import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
