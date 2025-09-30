import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  family: string;

  @Column({ default: 1 })
  authorizedPickups: number

  @Column()
  allergies: string;

  @Column()
  age: number;

  @Column()
  group: string;

  @Column()
  emergencyContact: string;

  @Column()
  emergencyPhone: string;

  @Column()
  parentEmail: string;

  @Column({ nullable: true })
  notes: string;
  attendances: any;
}
