// apps/health-service/src/health-service.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { DatabaseModule } from '../../libs/database/src/database.module';

import { HealthController } from './controller/health.controller';
import { HealthService } from './service/health.service';

import { Health } from './entities/health.entity';
import { HealthNote } from './entities/health-note.entity';

@Module({
  imports: [
    // Global config: tries .env.<NODE_ENV> then .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? [`.env.${process.env.NODE_ENV}`, '.env']
        : ['.env'],
    }),

    // Shared DB connection
    DatabaseModule.register(),

    // Feature repos
    TypeOrmModule.forFeature([Health, HealthNote]),

    // ---- Microservice client: CHILD_SERVICE ----
    // Adjust transport/options if you use Redis/NATS/etc.
    ClientsModule.registerAsync([
      {
        name: 'CHILD_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('CHILD_SERVICE_HOST', '127.0.0.1'),
            port: parseInt(config.get<string>('CHILD_SERVICE_PORT', '4010'), 10),
          },
        }),
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  // Export so other modules can reuse repos/service if needed
  exports: [TypeOrmModule, HealthService],
})
export class HealthServiceModule {}
