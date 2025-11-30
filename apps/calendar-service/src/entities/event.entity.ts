import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EventType } from '../dto/create-event.dto';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: ['field-trip', 'closure', 'meeting', 'holiday', 'training', 'maintenance'],
  })
  type: EventType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'date', nullable: true })
  date?: string;

  @Column({ type: 'time', nullable: true })
  time?: string;

  @Column({ type: 'boolean', default: false })
  allDay?: boolean;

  // 🔥 Link back to booking
  @Column({ type: 'varchar', length: 255, nullable: true })
  bookingId?: string;

  // 🔥 Emails & meeting type
  @Column({ type: 'varchar', length: 255, nullable: true })
  parentEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  organizerEmail?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  contactMethod?: 'in-person' | 'phone' | 'video';

  // 🔥 Duration for Google Calendar end time
  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  // 🔥 Google Calendar integration
  @Column({ type: 'varchar', length: 255, nullable: true })
  googleEventId?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  meetLink?: string;

  // 🔥 Direct link to the Google Calendar event (htmlLink)
  @Column({ type: 'varchar', length: 1024, nullable: true })
  calendarUrl?: string;
}
