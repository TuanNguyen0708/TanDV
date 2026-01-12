import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User age',
    example: 30,
  })
  @IsNumber()
  age: number;
}
