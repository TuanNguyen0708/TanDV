import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('models')
export class Model {
  @ApiProperty({ example: 'KL199' })
  @PrimaryColumn({ length: 50 })
  modelId: string;

  @ApiProperty({ example: 'Xe tải KL199' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ example: 'Mô tả chi tiết về dòng xe KL199', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;
}
