import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Station } from '../../station/entity/station.entity';

@Entity('station_daily_status')
export class StationDailyStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stationID: string;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'stationID' })
  station: Station;

  @Column({ type: 'date' })
  statusDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  stopTime: string;

  @Column({ type: 'int', nullable: true })
  totalDowntime: number;
}
