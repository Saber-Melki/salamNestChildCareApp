// apps/api-gateway/src/user-gateway.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/user-service/src/dto/create-user.dto';
import { UpdateUserDto } from 'apps/user-service/src/dto/update-user.dto';

@Controller('users')
export class UserGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  // 🔹 NEW: put this BEFORE @Get(':id') to avoid any route confusion
  @Get('messaging-recipients')
  async getMessagingRecipients() {
    console.log('[API-GW] GET /users/messaging-recipients');
    return this.userClient.send(
      { cmd: 'get_messaging_recipients' },
      {}, // payload (we can later add excludeUserId)
    );
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userClient.send({ cmd: 'create_user' }, dto);
  }

  @Get()
  async getAllUsers() {
    return this.userClient.send({ cmd: 'get_users' }, {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'get_user' }, id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userClient.send(
      { cmd: 'update_user' },
      { id, updateData: dto },
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'remove_user' }, id);
  }
}
