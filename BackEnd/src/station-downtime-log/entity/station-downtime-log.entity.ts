import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StationDailyStatus } from '../../station-daily-status/entity/station-daily-status.entity';

@Entity('station_downtime_log')
export class StationDowntimeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stationDailyID: string;

  @ManyToOne(() => StationDailyStatus)
  @JoinColumn({ name: 'stationDailyID' })
  stationDailyStatus: StationDailyStatus;

  @Column({ type: 'text', nullable: true })
  downTimeLog: string;

  @Column({ type: 'timestamp', nullable: true })
  downtimeStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  downtimeStop: Date;
}
