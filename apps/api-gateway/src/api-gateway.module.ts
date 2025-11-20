// apps/api-gateway/src/api-gateway.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './auth/strategies/jwt-refresh.strategy';
import { UserController } from './auth/user.controller';

import { ChildGatewayController } from './child-gateway.controller';
import { AttendanceGatewayController } from './attendance-gateway.controller';
import { BillingGatewayController } from './billing-gateway.module';
import { ShiftGatewayController } from './shift-gateway.controller';
import { MediaGatewayController } from './media-gateway.controller';
import { CalendarGatewayController } from './calendar-gateway.controller';
import { BookingGatewayController } from './booking.gateway.controller';
import { HealthGatewayController } from './health-gateway.controller';
import { StaffGatewayController } from './staff-gateway.controller';
import { UserGatewayController } from './user-gateway.controller';

// 👇 NEW: import the communication gateway controller
import { CommunicationGatewayController } from './communication/communication-gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'auth_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'user_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'CHILD_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'child_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'HEALTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'health_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'ATTENDANCE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'attendance_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'BILLING_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'billing_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'SHIFT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'shift_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'MEDIA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'media_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'CALENDAR_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'calendar_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'BOOKING_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'booking_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'STAFF_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'staff_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      // 👇 NEW: COMMUNICATION_SERVICE client
{
  name: 'COMMUNICATION_SERVICE',
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'communication_queue',     // 👈 MUST match microservice main.ts
      queueOptions: { durable: false },
    },
  }),
},

    ]),
  ],
  controllers: [
    AuthController,
    UserController,
    UserGatewayController,
    ChildGatewayController,
    HealthGatewayController,
    AttendanceGatewayController,
    BillingGatewayController,
    ShiftGatewayController,
    MediaGatewayController,
    CalendarGatewayController,
    BookingGatewayController,
    StaffGatewayController,
    // 👇 NEW controller so Swagger exposes /messages endpoints
    CommunicationGatewayController,
  ],
  providers: [JwtStrategy, JwtRefreshStrategy],
})
export class ApiGatewayModule {}
