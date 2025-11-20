// apps/user-service/src/services/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { PasswordResetCode } from '../entities/password-reset-code.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // 🔹 For link-based reset tokens
    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,

    // 🔹 For 6-digit verification codes
    @InjectRepository(PasswordResetCode)
    private readonly resetCodeRepo: Repository<PasswordResetCode>,
  ) {}

  private normalizeEmail(email?: string | null) {
    return (email ?? '').trim().toLowerCase();
  }

  // -------------------- CRUD --------------------

  async createUser(createUserDto: CreateUserDto) {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      url_img,
    } = createUserDto;

    const normalizedEmail = this.normalizeEmail(email);

    // case-insensitive existence check
    const existing = await this.userRepository.findOne({
      where: { email: ILike(normalizedEmail) },
      select: ['user_id'],
    });
    if (existing)
      throw new ConflictException('User with this email already exists');

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email: normalizedEmail,
      password_hash,
      first_name,
      last_name,
      phone: phone ?? null,
      role,
      url_img: url_img ?? null,
    });

    const saved = await this.userRepository.save(newUser);
    const { password_hash: _ignore, ...result } = saved;
    return result;
  }

  async getAllUsers() {
    return this.userRepository.find({
      select: [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'url_img',
      ],
    });
  }

  async getUserById(userId: string | number) {
    const id =
      typeof userId === 'number' ? userId : parseInt(userId as string, 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(`Invalid user id: ${userId}`);
    }

    const user = await this.userRepository.findOne({
      where: { user_id: id },
      select: [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'url_img',
      ],
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }

  async updateUser(id: string, updateData: UpdateUserDto) {
    const userId = parseInt(id, 10);
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    // Prevent raw password updates here
    if ('password' in updateData) delete (updateData as any).password;

    // Normalize email if provided
    if ((updateData as any).email) {
      (updateData as any).email = this.normalizeEmail(
        (updateData as any).email,
      );
    }

    await this.userRepository.update({ user_id: userId }, updateData as any);
    return this.getUserById(id);
  }

  async removeUser(id: string) {
    const userId = parseInt(id, 10);
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    await this.userRepository.delete({ user_id: userId });
    return { message: `User with ID ${id} has been deleted successfully` };
  }

  // -------------------- Auth helpers --------------------

  async findByEmailAndGetPassword(email: string) {
    const normalized = this.normalizeEmail(email);
    return this.userRepository.findOne({
      where: { email: ILike(normalized) },
      select: ['user_id', 'password_hash', 'role'],
    });
  }

  async validateUser(email: string, pass: string) {
    const normalized = this.normalizeEmail(email);
    const user = await this.userRepository.findOne({
      where: { email: ILike(normalized) },
      select: ['user_id', 'email', 'password_hash', 'role'],
    });
    if (!user) return null;

    const ok = await bcrypt.compare(pass, user.password_hash);
    return ok ? { UserId: user.user_id.toString(), role: user.role } : null;
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const hashed = await bcrypt.hash(refreshToken, 10);
      await this.userRepository.update(
        { user_id: parseInt(userId, 10) },
        { current_hashed_refresh_token: hashed },
      );
      return true;
    } catch {
      return false;
    }
  }

  async removeRefreshToken(userId: string): Promise<boolean> {
    try {
      await this.userRepository.update(
        { user_id: parseInt(userId, 10) },
        { current_hashed_refresh_token: null },
      );
      return true;
    } catch {
      return false;
    }
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: parseInt(userId, 10) },
      select: ['user_id', 'role', 'current_hashed_refresh_token'],
    });
    if (!user || !user.current_hashed_refresh_token) return null;

    const match = await bcrypt.compare(
      refreshToken,
      user.current_hashed_refresh_token,
    );
    return match ? { role: user.role, userid: user.user_id.toString() } : null;
  }

  // -------------------- Used by auth-service --------------------

  async userExistsByEmail(email: string): Promise<boolean> {
    const e = this.normalizeEmail(email);
    const user = await this.userRepository.findOne({
      where: { email: ILike(e) },
      select: ['user_id'],
    });
    return !!user;
  }

  async findUserByEmail(email: string) {
    const e = this.normalizeEmail(email);
    const user = await this.userRepository.findOne({
      where: { email: ILike(e) },
      select: ['user_id', 'email', 'role'],
    });
    return user
      ? { id: String(user.user_id), email: user.email, role: user.role }
      : null;
  }

  // ---------- OLD: link-based password reset ----------

  async createPasswordReset(data: {
    userId: string;
    email: string;
    tokenHash: string;
    expiresAt: string; // ISO
  }): Promise<boolean> {
    const userId = parseInt(data.userId, 10);

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      select: ['user_id'],
    });
    if (!user) return false;

    // Invalidate old tokens for this user/email
    await this.resetRepo.delete({
      user_id: userId,
      email: this.normalizeEmail(data.email),
    });

    const rec = this.resetRepo.create({
      user_id: userId,
      email: this.normalizeEmail(data.email),
      token_hash: data.tokenHash,
      expires_at: new Date(data.expiresAt),
    });
    await this.resetRepo.save(rec);
    return true;
  }

  async resetPasswordWithToken(
    tokenHash: string,
    newPassword: string,
  ): Promise<{ success: boolean; userId?: string; reason?: string }> {
    const record = await this.resetRepo.findOne({
      where: { token_hash: tokenHash },
    });
    if (!record) return { success: false, reason: 'invalid_token' };

    if (record.expires_at && record.expires_at.getTime() < Date.now()) {
      await this.resetRepo.delete({ id: record.id });
      return { success: false, reason: 'expired_token' };
    }

    const user = await this.userRepository.findOne({
      where: { user_id: record.user_id },
      select: ['user_id'],
    });
    if (!user) {
      await this.resetRepo.delete({ id: record.id });
      return { success: false, reason: 'user_not_found' };
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(
      { user_id: user.user_id },
      { password_hash },
    );

    await this.resetRepo.delete({ id: record.id });

    return { success: true, userId: String(user.user_id) };
  }

  // ---------- NEW: 6-digit code storage & verification ----------

  async createResetCode(data: {
    userId: string;
    email: string;
    codeHash: string;
    expiresAt: string; // ISO
  }): Promise<boolean> {
    const userId = parseInt(data.userId, 10);

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      select: ['user_id'],
    });
    if (!user) return false;

    const email = this.normalizeEmail(data.email);

    // Remove any previous codes for this user/email (optional but safer)
    await this.resetCodeRepo.delete({ userId, email });

    const rec = this.resetCodeRepo.create({
      userId,
      email,
      codeHash: data.codeHash,
      expiresAt: new Date(data.expiresAt),
      usedAt: null,
    });

    await this.resetCodeRepo.save(rec);
    return true;
  }

  async verifyResetCode(data: {
    email: string;
    codeHash: string;
  }): Promise<{ success: boolean; userId?: string; reason?: string }> {
    const email = this.normalizeEmail(data.email);
    const now = new Date();

    const record = await this.resetCodeRepo.findOne({
      where: {
        email,
        codeHash: data.codeHash,
        usedAt: null,
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      return { success: false, reason: 'invalid_or_expired_code' };
    }

    if (record.expiresAt && record.expiresAt.getTime() < now.getTime()) {
      await this.resetCodeRepo.delete({ id: record.id });
      return { success: false, reason: 'invalid_or_expired_code' };
    }

    // Mark code as used (so it cannot be reused)
    record.usedAt = new Date();
    await this.resetCodeRepo.save(record);

    return { success: true, userId: String(record.userId) };
  }

  // ------------------------------------------------
  // NEW: list recipients available for messaging
  // ------------------------------------------------
  async getMessagingRecipients(excludeUserId?: string) {
    console.log(
      '[user-service] getMessagingRecipients called, excludeUserId=',
      excludeUserId,
    );

    try {
      // 1) Fetch parents + staff (simple query)
      const users = await this.userRepository.find({
        where: [{ role: 'parent' }, { role: 'staff' }],
        select: ['user_id', 'first_name', 'last_name', 'email', 'role'],
      });

      console.log(
        `[user-service] getMessagingRecipients loaded ${users.length} users`,
      );

      // 2) Optionally exclude the current user
      let excludeNum: number | null = null;
      if (excludeUserId) {
        const parsed = parseInt(excludeUserId, 10);
        if (Number.isInteger(parsed) && parsed > 0) {
          excludeNum = parsed;
        }
      }

      const filtered = excludeNum
        ? users.filter((u) => u.user_id !== excludeNum)
        : users;

      // 3) Map to frontend shape
      const result = filtered.map((u) => ({
        id: String(u.user_id),
        name:
          `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() ||
          u.email ||
          `User #${u.user_id}`,
        role: u.role as 'admin' | 'staff' | 'parent',
        childName: null, // later: join children table if you want
      }));

      console.log(
        `[user-service] getMessagingRecipients returning ${result.length} recipients`,
      );

      return result;
    } catch (err) {
      console.error('[user-service] getMessagingRecipients error:', err);
      // IMPORTANT: do not throw – return [] so API gateway doesn't crash
      return [];
    }
  }
}
