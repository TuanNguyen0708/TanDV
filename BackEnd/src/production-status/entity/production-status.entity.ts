import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface StationTimelineEntry {
  stationID: string;
  stationName?: string;
  startTime: Date;
  endTime?: Date;
}

@Entity('production_status')
export class ProductionStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelID: string;

  @Column({ unique: true })
  vehicleID: string;

  @Column({ type: 'date' })
  productionDate: Date;

  @Column({ type: 'jsonb', default: '[]' })
  stationTimeline: StationTimelineEntry[];

  @Column({ type: 'enum', enum: ['OK', 'NG'], nullable: true })
  quality: string;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
