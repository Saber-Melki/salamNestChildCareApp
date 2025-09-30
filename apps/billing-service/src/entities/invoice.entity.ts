import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Invoice {
@PrimaryGeneratedColumn('uuid')
id: string;


@Column()
family: string;


@Column('numeric', { default: 0 })
amount: number;


@Column({ default: 'due' })
status: 'paid' | 'due' | 'overdue';


@Column()
dueDate: string;


@Column({ type: 'jsonb', nullable: true })
items: { description: string; amount: number }[];


@Column({ nullable: true })
notes?: string;
}