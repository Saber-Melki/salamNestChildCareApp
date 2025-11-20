// apps/user-service/src/entities/password-reset-token.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('password_reset_tokens')
@Index('IDX_reset_user_token', ['user_id', 'token_hash'], { unique: true })
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  // FK to users.user_id
  @Column({ type: 'int' })
  user_id: number;

  // store normalized email for quick audits/debug (always lowercase)
  @Column({
    type: 'varchar',
    length: 255,
    transformer: {
      to: (v?: string) => (v ?? '').trim().toLowerCase(),
      from: (v: string) => v,
    },
  })
  email: string;

  // sha256 hex string => 64 chars
  @Column({ type: 'varchar', length: 64 })
  token_hash: string;

  // when the token expires
  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;
}
