import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { HealthNote } from './health-note.entity';

@Entity()
export class Health {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() child: string;
  @Column({ default: 'None' }) allergies: string;
  @Column({ default: 'Up to date' }) immunizations: string;
  @Column({ default: 'N/A' }) emergency: string;

  @OneToMany(() => HealthNote, (note) => note.health, { cascade: true })
  notes: HealthNote[];
}
