import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { UserController } from './controller/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordResetCode } from './entities/password-reset-code.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(),
    TypeOrmModule.forFeature([User,PasswordResetToken,PasswordResetCode]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
