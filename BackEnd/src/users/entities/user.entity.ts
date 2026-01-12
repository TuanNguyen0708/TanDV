import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'User age',
    example: 30,
  })
  @Column()
  age: number;
}
