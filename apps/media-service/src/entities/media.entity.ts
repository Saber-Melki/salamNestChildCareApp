import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum MediaType {
  Image = "image",
  Video = "video"
}

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.Image })
  type: MediaType;

  @Column()
  url: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  albumId: string;

  @Column()
  uploadDate: string;

  @Column("simple-array", { nullable: true })
  tags: string[];

  @Column("simple-array", { nullable: true })
  sharedWith: string[];
}
