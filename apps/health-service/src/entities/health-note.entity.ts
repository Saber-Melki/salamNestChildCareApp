import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Health } from './health.entity';

@Entity()
export class HealthNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() noteType: string;
  @Column() description: string;
  @Column() date: string;
  @Column({ nullable: true }) followUp: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'resolved' | 'pending';

  @ManyToOne(() => Health, (health) => health.notes, { onDelete: 'CASCADE' })
  health: Health;
}
