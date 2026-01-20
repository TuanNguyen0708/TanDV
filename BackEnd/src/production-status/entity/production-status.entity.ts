import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('production_status')
export class ProductionStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelID: string;

  @Column()
  vehicleID: string;

  @Column({ type: 'date' })
  productionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  stationStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  stationEnd: Date;

  @Column({ type: 'enum', enum: ['OK', 'NG'], nullable: true })
  quality: string;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
