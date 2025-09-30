import { Module } from '@nestjs/common';
import { StaffServiceController } from './staff-service.controller';
import { StaffServiceService } from './staff-service.service';

@Module({
  imports: [],
  controllers: [StaffServiceController],
  providers: [StaffServiceService],
})
export class StaffServiceModule {}
