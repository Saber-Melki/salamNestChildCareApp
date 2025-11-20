import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MessageThread } from './message-thread.entity';

export type MessageType = 'text' | 'image' | 'file' | 'audio';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageFrom = 'you' | 'parent';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  threadId: string;

  @ManyToOne(() => MessageThread, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: MessageThread;

  // who actually sent the message (user id)
  @Column({ nullable: true })
  fromUserId: string | null;

  // 👇 who is this "from" from the FRONTEND point of view ("you" | "parent")
  @Column({
    type: 'varchar',
    default: 'you',
  })
  from: MessageFrom;

  @Column({ type: 'text' })
  text: string;

  @Column({
    type: 'varchar',
    default: 'text',
  })
  type: MessageType;

  @Column({
    type: 'varchar',
    default: 'sent',
  })
  status: MessageStatus;

  // 👇 optional importance flag used in your DTO
  @Column({ type: 'boolean', default: false })
  isImportant: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
