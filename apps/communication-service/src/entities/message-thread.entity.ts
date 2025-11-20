import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { ThreadParticipant } from './thread-participant.entity';

export type ThreadPriority = 'high' | 'normal' | 'low';

@Entity('message_threads')
export class MessageThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  familyName: string | null;

  @Column({ nullable: true })
  childName: string | null;

  @Column({
    type: 'varchar',
    default: 'normal',
  })
  priority: ThreadPriority;

  // 👇 NEW: last message text (for thread list)
  @Column({ type: 'text', nullable: true })
  lastMessage: string | null;

  // 👇 NEW: last message time
  @Column({ type: 'timestamp', nullable: true })
  lastMessageTime: Date | null;

  // 👇 NEW: unread messages count (for staff side, for example)
  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (msg) => msg.thread)
  messages: Message[];

  @OneToMany(() => ThreadParticipant, (p) => p.thread)
  participants: ThreadParticipant[];
}
