import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StationStatusCode } from '../../common/enums/station-status-code.enum';

@Entity('station')
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stationName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: StationStatusCode,
    default: StationStatusCode.IDLE,
  })
  currentStatusCode: StationStatusCode;

  @Column({ type: 'text', nullable: true })
  currentStatusBrief: string;
}
