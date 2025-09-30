import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from '../service/attendance.service';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Get all attendances
  @MessagePattern('find_all_attendance')
  async findAll() {
    return this.attendanceService.findAll();
  }

  // Get one attendance by ID
  @MessagePattern('find_one_attendance')
  async findOne(@Payload() id: string) {
    return this.attendanceService.findOne(id);
  }

  // Remove attendance
  @MessagePattern('remove_attendance')
  async remove(@Payload() id: string) {
    return this.attendanceService.remove(id);
  }

  // Update attendance (for check-in / check-out)
  @MessagePattern('update_attendance')
  async update(
    @Payload() data: { id: string; updateAttendanceDto: UpdateAttendanceDto },
  ) {
    return this.attendanceService.update(
      data.id,
      data.updateAttendanceDto,
    );
  }

  // Specific pattern for CHECK-IN
  @MessagePattern('check_in')
  async checkIn(@Payload() employeeId: string) {
    return this.attendanceService.checkIn(employeeId);
  }

  // Specific pattern for CHECK-OUT
  @MessagePattern('check_out')
  async checkOut(@Payload() employeeId: string) {
    return this.attendanceService.checkOut(employeeId);
  }
}
