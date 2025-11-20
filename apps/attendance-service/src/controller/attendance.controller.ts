import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from '../service/attendance.service';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ── existing patterns (keep as-is) ─────────────────────────────────────
  @MessagePattern('create_attendance')
  create(@Payload() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @MessagePattern('find_all_attendance')
  findAll() {
    return this.attendanceService.findAll();
  }

  @MessagePattern('find_one_attendance')
  findOne(@Payload() id: string) {
    return this.attendanceService.findOne(id);
  }

  @MessagePattern('remove_attendance')
  remove(@Payload() id: string) {
    return this.attendanceService.remove(id);
  }

  @MessagePattern('update_attendance')
  update(
    @Payload() data: { id: string; updateAttendanceDto: UpdateAttendanceDto },
  ) {
    return this.attendanceService.update(data.id, data.updateAttendanceDto);
  }

  @MessagePattern('check_in')
  childCheckIn(@Payload() childId: string) {
    return this.attendanceService.checkIn(childId);
  }

  @MessagePattern('check_out')
  childCheckOut(@Payload() childId: string) {
    return this.attendanceService.checkOut(childId);
  }

  // ── NEW: staff patterns required by your gateway ───────────────────────
  @MessagePattern('staff_check_in')
  staffCheckIn(@Payload() staffId: string) {
    return this.attendanceService.staffCheckIn(staffId);
  }

  @MessagePattern('staff_check_out')
  staffCheckOut(@Payload() staffId: string) {
    return this.attendanceService.staffCheckOut(staffId);
  }

  @MessagePattern('staff_today')
  staffToday(@Payload() staffId: string) {
    return this.attendanceService.staffToday(staffId);
  }
}
