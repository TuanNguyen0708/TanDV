import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('station')
export class Station {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'ST01' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ example: 'Khung gầm' })
  @Column()
  name: string;

  @ApiProperty({ example: 1 })
  @Column()
  sequence: number;

  @Column({ default: true })
  isActive: boolean;
}
