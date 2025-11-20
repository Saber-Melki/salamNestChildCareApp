import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type StaffAttendanceStatus = 'present' | 'away';

@Entity({ name: 'staff_attendances' })
@Index(['staffId', 'date'], { unique: true })
export class StaffAttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staffId: string;

  // YYYY-MM-DD
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 10, default: 'present' })
  status: StaffAttendanceStatus;

  // HH:MM:SS (nullable until set)
  @Column({ type: 'time', nullable: true })
  checkIn?: string;

  @Column({ type: 'time', nullable: true })
  checkOut?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
