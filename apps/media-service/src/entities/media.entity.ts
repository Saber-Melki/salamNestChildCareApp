// apps/media-service/src/entities/media.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Album } from './album.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;

  @Column()
  url: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  // 🔴 IMPORTANT CHANGE: make it nullable so schema sync passes
  @Column({ type: 'uuid', nullable: true })
  albumId: string | null;

  @ManyToOne(() => Album, (album) => album.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'albumId' })
  album: Album;

  @CreateDateColumn()
  uploadDate: Date;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('simple-array', { nullable: true })
  sharedWith?: string[];
}
