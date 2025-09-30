import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Shift {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  staff: string;

  @ApiProperty()
  @Column()
  day: string;

  @ApiProperty()
  @Column()
  start: string;

  @ApiProperty()
  @Column()
  end: string;

  @ApiProperty()
  @Column()
  role: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  notes?: string;
}
