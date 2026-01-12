import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('production_daily_plans')
@Unique(['model', 'workDate'])
export class ProductionDailyPlans {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  model: string;

  @Column({ type: 'date', name: 'work_date' })
  workDate: string;

  @Column({ type: 'int', name: 'planned_day' })
  plannedDay: number;

  @Column({ type: 'int', name: 'actual_day', default: 0 })
  actualDay: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
