import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EventType } from '../dto/create-event.dto';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'enum', enum: ['field-trip','closure','meeting','holiday','training','maintenance'] })
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
}
