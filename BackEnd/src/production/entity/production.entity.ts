import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductionStationLog } from '../../production-station-log/entity/production-station-log.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum QualityStatus {
  OK = 'OK',
  NG = 'NG',
}

@Entity('production')
export class Production {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'XE001' })
  @Column()
  productionNo: string;

  @ApiProperty({ example: 'KL199' })
  @Column()
  model: string;

  @ApiProperty({ example: '2026-01-13' })
  @Column({ type: 'date' })
  productionDate: string;

  @ApiProperty({ enum: QualityStatus, required: false })
  @Column({ type: 'enum', enum: QualityStatus, nullable: true })
  qualityStatus?: QualityStatus;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  remark?: string;

  @OneToMany(() => ProductionStationLog, (log) => log.production)
  stations: ProductionStationLog[];
}
