import { Controller, Post, Body, Inject, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from './create-user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Post()
  async createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    console.log(
      '✅ API Gateway received POST /users request, sending to user-service...',
    );
    return await firstValueFrom(
      this.userClient.send({ cmd: 'create_user' }, createUserDto),
    );
  }
}
