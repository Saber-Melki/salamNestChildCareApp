// apps/communication-service/src/communication.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommunicationService } from './communication.service';

@Controller()
export class CommunicationController {
  private readonly logger = new Logger(CommunicationController.name);

  constructor(private readonly commService: CommunicationService) {}

  // ---------- LIST THREADS ----------
  @MessagePattern({ cmd: 'comm_list_threads_for_user' })
  async listThreads(@Payload() data: { userId: string | number }) {
    this.logger.log(
      `comm_list_threads_for_user payload=${JSON.stringify(data)}`,
    );

    // service expects a payload object { userId }
    return this.commService.listThreadsForUser({ userId: data.userId });
  }

  // ---------- GET MESSAGES IN THREAD ----------
  @MessagePattern({ cmd: 'comm_get_thread_messages' })
  async getMessages(
    @Payload() data: { threadId: string; userId: string | number },
  ) {
    return this.commService.getThreadMessages(data.threadId, data.userId);
  }

  // ---------- SEND MESSAGE ----------
  @MessagePattern({ cmd: 'comm_send_message' })
  async sendMessage(
    @Payload()
    data: {
      threadId: string;
      text: string;
      type?: 'text' | 'image' | 'file' | 'audio';
      senderId: string | number;
    },
  ) {
    return this.commService.sendMessage({
      threadId: data.threadId,
      text: data.text,
      type: data.type,
      senderId: data.senderId,
    });
  }

  // ---------- CREATE / GET DM THREAD ----------
  @MessagePattern({ cmd: 'comm_get_or_create_dm_thread' })
  async getOrCreateDm(
    @Payload() data: { userId: string | number; targetUserId: string | number },
  ) {
    this.logger.log(
      `comm_get_or_create_dm_thread payload=${JSON.stringify(data)}`,
    );

    return this.commService.getOrCreateDmThread(
      String(data.userId),
      String(data.targetUserId),
    );
  }
}
