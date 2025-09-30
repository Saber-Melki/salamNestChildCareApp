import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BookingStatus, ContactMethod } from '../dto/create-booking.dto';


@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  parentName: string;

  @Column({ type: 'varchar' })
  childName: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar' })
  time: string;

  @Column({ type: 'int', default: 30 })
  duration: number;

  @Column({ type: 'enum', enum: ['in-person', 'phone', 'video'], default: 'in-person' })
  contactMethod: ContactMethod;

  @Column({ type: 'varchar', nullable: true })
  purpose?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
