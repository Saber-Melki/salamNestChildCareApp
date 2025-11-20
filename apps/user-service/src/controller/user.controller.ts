import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { LoginDto } from '../dto/login.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() data: any) {
    return this.userService.createUser(data);
  }

  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.userService.getAllUsers();
  }

  @MessagePattern({ cmd: 'get_user' })
  getUser(@Payload() payload: any) {
    // payload can be:
    // - "20"   (string)
    // - 20     (number)
    // - { id: "20" } or { id: 20 }
    // - { userId: "20" } or { userId: 20 }

    const id =
      typeof payload === 'string' || typeof payload === 'number'
        ? payload
        : payload?.id ?? payload?.userId;

    return this.userService.getUserById(id);
  }

  @MessagePattern({ cmd: 'update_user' })
  updateUser(@Payload() data: { id: string; updateData: UpdateUserDto }) {
    return this.userService.updateUser(data.id, data.updateData);
  }

  @MessagePattern({ cmd: 'remove_user' })
  removeUser(@Payload() payload: any) {
    const id =
      typeof payload === 'string' || typeof payload === 'number'
        ? String(payload)
        : String(payload?.id ?? payload?.userId);

    return this.userService.removeUser(id);
  }

  @MessagePattern({ cmd: 'validate_user' })
  validateUser(@Payload() loginDto: LoginDto) {
    return this.userService.validateUser(loginDto.email, loginDto.password);
  }

  @MessagePattern({ cmd: 'set_refresh_token' })
  setRefreshToken(@Payload() data: { userId: string; refreshToken: string }) {
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

  // ---------- Lookups ----------

  @MessagePattern({ cmd: 'find_user_by_email' })
  findUserByEmail(@Payload() data: { email: string }) {
    return this.userService.findUserByEmail(data.email);
  }

  @MessagePattern({ cmd: 'user_exists_by_email' })
  userExistsByEmail(@Payload() data: { email: string }) {
    return this.userService.userExistsByEmail(data.email);
  }

  // ---------- Link-based reset token ----------

  @MessagePattern({ cmd: 'create_password_reset' })
  createPasswordReset(
    @Payload()
    data: { userId: string; email: string; tokenHash: string; expiresAt: string },
  ) {
    return this.userService.createPasswordReset(data);
  }

  @MessagePattern({ cmd: 'reset_password_with_token' })
  resetPasswordWithToken(
    @Payload() data: { tokenHash: string; newPassword: string },
  ) {
    return this.userService.resetPasswordWithToken(
      data.tokenHash,
      data.newPassword,
    );
  }

  // ---------- NEW: 6-digit codes ----------

  @MessagePattern({ cmd: 'create_reset_code' })
  createResetCode(
    @Payload()
    data: { userId: string; email: string; codeHash: string; expiresAt: string },
  ) {
    return this.userService.createResetCode(data);
  }

  @MessagePattern({ cmd: 'verify_reset_code' })
  verifyResetCode(@Payload() data: { email: string; codeHash: string }) {
    return this.userService.verifyResetCode(data);
  }
@MessagePattern({ cmd: 'get_messaging_recipients' })
  async getMessagingRecipients(
    @Payload() data: { excludeUserId?: string },
  ) {
    console.log(
      '[user-service] pattern: get_messaging_recipients payload=',
      data,
    );
    return this.userService.getMessagingRecipients(data?.excludeUserId);
  }
}
