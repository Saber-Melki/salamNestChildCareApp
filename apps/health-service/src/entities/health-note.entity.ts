import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Health } from './health.entity';

@Entity()
export class HealthNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  noteType: string;

  @Column()
  description: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  followUp: string;

  @ManyToOne(() => Health, (health) => health.notes)
  health: Health;
}
