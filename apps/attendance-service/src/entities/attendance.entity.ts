import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  childId: string; // juste lier par id, sans relation Child

  @Column()
  date: string; // yyyy-mm-dd

  @Column({ nullable: true })
  checkIn?: string; // heure d’arrivée

  @Column({ nullable: true })
  checkOut?: string; // heure de départ
}
