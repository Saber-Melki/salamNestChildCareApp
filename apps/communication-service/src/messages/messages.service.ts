import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageThread } from '../entities/message-thread.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageThread)
    private readonly threadRepo: Repository<MessageThread>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  // Helper: ensure the thread exists
  async ensureThread(id: string): Promise<MessageThread> {
    const thread = await this.threadRepo.findOne({ where: { id } });
    if (!thread) {
      throw new NotFoundException(`Thread ${id} not found`);
    }
    return thread;
  }

  async getMessagesByThread(threadId: string): Promise<any[]> {
    await this.ensureThread(threadId);

    const messages = await this.messageRepo.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
    });

    // Map to shape expected by frontend
    return messages.map((m) => ({
      id: m.id,
      from: m.from, // 'you' | 'parent'
      text: m.text,
      time: m.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: m.status,
      type: m.type,
      isImportant: m.isImportant,
      reactions: [], // placeholder for future reactions
    }));
  }

  async createMessage(
    dto: CreateMessageDto & { fromUserId?: string },
  ): Promise<any> {
    const thread = await this.ensureThread(dto.threadId);

    const msg = this.messageRepo.create({
      threadId: dto.threadId,
      from: dto.from, // 'you' | 'parent'
      fromUserId: dto.fromUserId ?? null,
      text: dto.text,
      type: dto.type ?? 'text',
      status: 'sent',
      isImportant: dto.isImportant ?? false,
    });

    const saved = await this.messageRepo.save(msg);

    // update thread last message
    thread.lastMessage = dto.text;
    thread.lastMessageTime = new Date();
    if (dto.from === 'parent') {
      // example: increase unread for staff
      thread.unreadCount = (thread.unreadCount ?? 0) + 1;
    }
    await this.threadRepo.save(thread);

    return {
      id: saved.id,
      from: saved.from,
      text: saved.text,
      time: saved.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: saved.status,
      type: saved.type,
      isImportant: saved.isImportant,
      reactions: [],
    };
  }

  // Optional: list all threads (for future "threads list" API)
  async listThreads(): Promise<MessageThread[]> {
    return this.threadRepo.find({ order: { updatedAt: 'DESC' } });
  }
}
