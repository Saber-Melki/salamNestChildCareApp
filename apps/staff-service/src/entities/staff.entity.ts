import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'staff' })
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'varchar', default: 'teacher' })
  role: string; // Exemple: teacher, admin, assistant...

  @Column({ type: 'varchar', default: 'active' })
  status: string; // Exemple: active, inactive, on_leave...

  @Column({ type: 'date', nullable: true })
  hireDate: string;

  @Column({ nullable: true })
  address: string;

  // Contact d’urgence au format JSON
  @Column('simple-json', { nullable: true })
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };

  // Liste de certifications sous forme de tableau
  @Column('simple-array', { nullable: true })
  certifications?: string[];

  // Salaire horaire avec 2 décimales
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  hourlyRate: number;

  // Heures par semaine
  @Column({ type: 'int', default: 0 })
  weeklyHours: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  avatar: string;
}
