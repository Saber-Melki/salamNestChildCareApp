import { Controller, Post, Get, Delete, Param, Body, Inject, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAttendanceDto } from 'apps/attendance-service/src/dto/create-attendance.dto';
import { UpdateAttendanceDto } from 'apps/attendance-service/src/dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceGatewayController {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceClient.send('create_attendance', dto);
  }

  @Get()
  async findAll() {
    return this.attendanceClient.send('find_all_attendance', {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.attendanceClient.send('find_one_attendance', id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceClient.send('update_attendance', { id, updateAttendanceDto: dto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.attendanceClient.send('remove_attendance', id);
  }
}
