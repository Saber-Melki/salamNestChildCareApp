import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module'; 
import { AttendanceController } from './controller/attendance.controller'; // RabbitMQ
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './service/attendance.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(), 
    TypeOrmModule.forFeature([Attendance]),
  ],
  controllers: [
    AttendanceController,    
  ],
  providers: [AttendanceService],
})
export class AttendanceModule {}
