import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  url_img: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'staff', 'parent'], // Based on the Role table
    default: 'parent',
  })
  role: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', nullable: true })
  current_hashed_refresh_token: string | null;
  // Note: In a true microservice architecture, direct relations like this
  // are often avoided. Instead, you would store `userId` in the other services.
  // I am including them to show how TypeORM would represent your diagram directly.
}
