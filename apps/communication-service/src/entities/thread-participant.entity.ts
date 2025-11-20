import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageThread } from './message-thread.entity';

@Entity('thread_participants')
export class ThreadParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  threadId: string;

  @ManyToOne(() => MessageThread, (thread) => thread.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: MessageThread;

  @Column()
  userId: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
