// apps/user-service/src/user.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() createUserDto: CreateUserDto) {
    console.log('✅ Message received in user-service: create_user');
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'validate_user' })
  validateUser(@Payload() loginDto: LoginDto) {
    // <-- USE THE DTO
    console.log(
      `[UserService] Message received: validate_user for ${loginDto.email}`,
    );
    return this.userService.validateUser(loginDto.email, loginDto.password);
  }

  @MessagePattern({ cmd: 'set_refresh_token' })
  setRefreshToken(@Payload() data: { userId: string; refreshToken: string }) {
    console.log(
      `[UserService] Message received: set_refresh_token for user ${data.userId}`,
    );
    return this.userService.setCurrentRefreshToken(
      data.refreshToken,
      data.userId,
    );
  }

  @MessagePattern({ cmd: 'remove_refresh_token' })
  removeRefreshToken(@Payload() data: { userId: string }) {
    return this.userService.removeRefreshToken(data.userId);
  }

  @MessagePattern({ cmd: 'validate_refresh_token' })
  validateRefreshToken(
    @Payload() data: { refreshToken: string; userId: string },
  ) {
    return this.userService.getUserIfRefreshTokenMatches(
      data.refreshToken,
      data.userId,
    );
  }
}
