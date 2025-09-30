import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, first_name, last_name, role } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      role,
    });

    const savedUser = await this.userRepository.save(newUser);
    const { password_hash: _, ...result } = savedUser;
    return result;
  }
  async findByEmailAndGetPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['user_id', 'password_hash', 'role'],
    });
  }

  async validateUser(email: string, pass: string) {
    console.log(`[UserService] Validating user: ${email}`);
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        console.log(`[UserService] Authentication failed: User not found.`);
        return null;
      }

      const isPasswordMatching = await bcrypt.compare(pass, user.password_hash);

      if (isPasswordMatching) {
        console.log(
          `[UserService] Authentication successful for user ${user.user_id}`,
        );
        return { UserId: user.user_id.toString(), role: user.role };
      } else {
        console.log(`[UserService] Authentication failed: Invalid password.`);
        return null;
      }
    } catch (error) {
      console.error(
        '[UserService] An unexpected error occurred during user validation:',
        error,
      );
      return null;
    }
  }
  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userRepository.update(userId, {
        current_hashed_refresh_token: hashedRefreshToken,
      });
      return true;
    } catch (error) {
      console.error('[UserService] Failed to set refresh token:', error);
      return false;
    }
  }

  async removeRefreshToken(userId: string): Promise<boolean> {
    try {
      await this.userRepository.update(userId, {
        current_hashed_refresh_token: null,
      });
      return true;
    } catch (error) {
      console.error('[UserService] Failed to remove refresh token:', error);
      return false;
    }
  }
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userRepository.findOneBy({
      user_id: parseInt(userId, 10),
    });
    const isMatch = await bcrypt.compare(
      refreshToken,
      user.current_hashed_refresh_token,
    );

    if (isMatch) {
      return { role: user.role, userid: user.user_id.toString() };
    }
    return null;
  }
}
