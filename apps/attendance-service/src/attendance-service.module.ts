import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module'; 
import { AttendanceController } from './controller/attendance.controller'; // RabbitMQ
import { AttendanceEntity } from './entities/attendance.entity';
import { AttendanceService } from './service/attendance.service';
import { StaffAttendanceEntity } from './entities/staff-attendance.entity';
import { RestAttendanceController } from './controller/rest-attendance.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(), 
    TypeOrmModule.forFeature([AttendanceEntity,StaffAttendanceEntity]),
  ],
  controllers: [
    AttendanceController,  
    RestAttendanceController  
  ],
  providers: [AttendanceService],
})
export class AttendanceModule {}
