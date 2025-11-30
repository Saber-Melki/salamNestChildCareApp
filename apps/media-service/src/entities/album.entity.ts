import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: 0 })
  itemCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Media, (media) => media.album)
  media: Media[];
}
