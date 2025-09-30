// apps/health-service/src/health-service.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { HealthController } from './controller/health.controller';
import { Health } from './entities/health.entity';
import { HealthService } from './service/health.service';
import { HealthNote } from './entities/health-note.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(), // module partagé pour gérer TypeORM
    TypeOrmModule.forFeature([Health, HealthNote]), // dépôts spécifiques
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthServiceModule {}
