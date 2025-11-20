import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthHttpController } from './controllers/auth.http.controller'; // <-- add this
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' }),
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: 'user_queue',
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
  ],
  controllers: [
    AuthController,
    AuthHttpController, // <-- register it
  ],
  providers: [AuthService],
})
export class AuthServiceModule {}
