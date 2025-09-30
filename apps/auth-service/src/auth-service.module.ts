import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    // This MUST be first. It tells Nest to load the .env file from the project root.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env', // The path from the root directory
    }),

    // Register JWT for creating tokens
    JwtModule.register({}),

    // Register the client that allows this service to talk to the user-service
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          if (!rabbitmqUrl) {
            throw new Error(
              'FATAL: RABBITMQ_URL was not found in the .env file!',
            );
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'user_queue',
              queueOptions: { durable: false },
            },
          };
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthServiceModule {}
