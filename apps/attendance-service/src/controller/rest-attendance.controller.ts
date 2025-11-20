import { Controller, Param, Post, Get } from '@nestjs/common';
import { AttendanceService } from '../service/attendance.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('attendance-staff')
@Controller('attendance/staff')
export class RestAttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @ApiOperation({ summary: 'Staff check-in (idempotent for the day)' })
  @Post(':staffId/check-in')
  async staffCheckIn(@Param('staffId') staffId: string) {
    return this.attendance.staffCheckIn(staffId);
  }

  @ApiOperation({ summary: 'Staff check-out (idempotent for the day)' })
  @Post(':staffId/check-out')
  async staffCheckOut(@Param('staffId') staffId: string) {
    return this.attendance.staffCheckOut(staffId);
  }

  @ApiOperation({ summary: 'Get today status for a staff member' })
  @Get(':staffId/today')
  async staffToday(@Param('staffId') staffId: string) {
    return this.attendance.staffToday(staffId);
  }
}
