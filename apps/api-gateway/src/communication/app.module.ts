import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthHttpController } from 'apps/auth-service/src/controllers/auth.http.controller';
import { CommunicationGatewayController } from './communication-gateway.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Auth


// NEW: communication gateway controller

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'COMMUNICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
            queue: 'communication_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      // ... your other clients (AUTH_SERVICE, USER_SERVICE, etc.)
    ]),
  ],
  controllers: [
    AuthHttpController,
    CommunicationGatewayController, // 👈 add here
    // other HTTP controllers...
  ],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
