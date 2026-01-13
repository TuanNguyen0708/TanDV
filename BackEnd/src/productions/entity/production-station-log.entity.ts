import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Production } from './production.entity';
import { Station } from './station.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum StationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  STOP = 'STOP',
}

@Entity('production_station_log')
@Unique(['production', 'station'])
export class ProductionStationLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Production, (p) => p.stations, { onDelete: 'CASCADE' })
  production: Production;

  @ManyToOne(() => Station)
  station: Station;

  @ApiProperty({ enum: StationStatus, required: false })
  @Column({ type: 'enum', enum: StationStatus, nullable: true })
  status?: StationStatus;

  @ApiProperty({ example: 'Chờ vật tư', required: false })
  @Column({ nullable: true })
  reason?: string;

  @ApiProperty({ example: '2026-01-13T07:30:00' })
  @Column({ type: 'timestamp', nullable: true })
  startTime?: Date;

  @ApiProperty({ example: '2026-01-13T07:50:00' })
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @ApiProperty({ example: 20 })
  @Column({ nullable: true })
  periodMinutes?: number;
}
