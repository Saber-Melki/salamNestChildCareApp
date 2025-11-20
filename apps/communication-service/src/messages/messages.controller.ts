import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // GET /messages/:threadId
  @Get(':threadId')
  async getByThread(@Param('threadId') threadId: string) {
    return this.messagesService.getMessagesByThread(threadId);
  }

  // POST /messages
  @Post()
  async create(@Body() dto: CreateMessageDto) {
    return this.messagesService.createMessage(dto);
  }

  // Optional: GET /messages-threads -> list threads
  @Get()
  async listThreads() {
    return this.messagesService.listThreads();
  }
}
