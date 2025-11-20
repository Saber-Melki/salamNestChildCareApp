// apps/api-gateway/src/communication/communication-gateway.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtUserPayload,
} from '../auth/decorators/current-user.decorator';

// ------------ Swagger DTOs ---------------

class ThreadDto {
  id: string;
  last?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  priority?: 'high' | 'normal' | 'low';
  // you can add participants?: string[] later if you want
}

class MessageDto {
  id: string;
  threadId: string;
  from: 'you' | 'parent';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file' | 'audio';
  isImportant?: boolean;
}

class SendMessageBody {
  threadId: string;
  text: string;
  type?: 'text' | 'image' | 'file' | 'audio';
}

class CreateThreadBody {
  targetUserId: string;
}

// ------------ Controller ---------------

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class CommunicationGatewayController {
  constructor(
    @Inject('COMMUNICATION_SERVICE')
    private readonly commClient: ClientProxy,
  ) {}

  // 1) GET /messages/threads
  @Get('threads')
  @ApiOperation({
    summary: 'List all conversation threads for the current user',
  })
  @ApiOkResponse({ type: ThreadDto, isArray: true })
  async getThreads(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<ThreadDto[]> {
    const userId = user.userid;

    return firstValueFrom(
      this.commClient
        .send<ThreadDto[]>(
          { cmd: 'comm_list_threads_for_user' },
          { userId },
        )
        .pipe(timeout(5000)),
    );
  }

  // 2) POST /messages/threads → create/get DM thread
  @Post('threads')
  @ApiOperation({
    summary: 'Create or get a DM thread with a specific user',
  })
  @ApiBody({ type: CreateThreadBody })
  @ApiOkResponse({ type: ThreadDto })
  async createOrGetThread(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: CreateThreadBody,
  ): Promise<ThreadDto> {
    const userId = user.userid;

    return firstValueFrom(
      this.commClient
        .send<ThreadDto>(
          { cmd: 'comm_get_or_create_dm_thread' },
          { userId, targetUserId: body.targetUserId },
        )
        .pipe(timeout(5000)),
    );
  }

  // 3) GET /messages/:threadId
  @Get(':threadId')
  @ApiOperation({ summary: 'Get all messages in a thread' })
  @ApiOkResponse({ type: MessageDto, isArray: true })
  async getMessages(
    @CurrentUser() user: JwtUserPayload,
    @Param('threadId') threadId: string,
  ): Promise<MessageDto[]> {
    const userId = user.userid;

    return firstValueFrom(
      this.commClient
        .send<MessageDto[]>(
          { cmd: 'comm_get_thread_messages' },
          { threadId, userId },
        )
        .pipe(timeout(5000)),
    );
  }

  // 4) POST /messages
  @Post()
  @ApiOperation({ summary: 'Send a message in a thread' })
  @ApiBody({ type: SendMessageBody })
  @ApiOkResponse({ type: MessageDto })
  async sendMessage(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: SendMessageBody,
  ): Promise<MessageDto> {
    const userId = user.userid;

    return firstValueFrom(
      this.commClient
        .send<MessageDto>(
          { cmd: 'comm_send_message' },
          {
            threadId: body.threadId,
            text: body.text,
            type: body.type ?? 'text',
            senderId: userId,
          },
        )
        .pipe(timeout(5000)),
    );
  }
}
