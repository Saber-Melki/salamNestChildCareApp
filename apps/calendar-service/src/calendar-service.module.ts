// apps/calendar-service/src/calendar-service.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { EventEntity } from 'apps/calendar-service/src/entities/event.entity';
import { CalendarController } from 'apps/calendar-service/src/controller/calendar.controller';
import { CalendarService } from 'apps/calendar-service/src/service/calendar.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(),
    TypeOrmModule.forFeature([EventEntity]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
