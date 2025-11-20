import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../dto/create-user.dto'; // reuse enum

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique ID of the user' })
  @PrimaryGeneratedColumn()
  user_id: number;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Column()
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Column()
  last_name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @Column({ nullable: true })
  url_img: string;

  @ApiProperty({ example: '+21612345678', required: false })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.PARENT,
    description: 'Role of the user',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PARENT,
  })
  role: string;

  @ApiProperty({
    example: 'hashed_password_here',
    description: 'Hashed password of the user',
  })
  @Column()
  password_hash: string;

  @ApiProperty({ example: '2025-10-04T12:00:00Z', description: 'Creation date' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2025-10-04T12:30:00Z', description: 'Last update date' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    example: 'some_refresh_token_hash',
    required: false,
    description: 'Hashed refresh token for sessions',
  })
  @Column({ type: 'varchar', nullable: true })
  current_hashed_refresh_token: string | null;
}
