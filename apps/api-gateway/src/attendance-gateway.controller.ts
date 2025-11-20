import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateAttendanceDto } from 'apps/attendance-service/src/dto/create-attendance.dto';
import { UpdateAttendanceDto } from 'apps/attendance-service/src/dto/update-attendance.dto';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceGatewayController {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy,
  ) {}

  /* ─────────────────────────── CRUD (children) ─────────────────────────── */

  @ApiOperation({ summary: 'Create a child attendance record' })
  @ApiBody({ type: CreateAttendanceDto })
  @ApiOkResponse({ description: 'Attendance created' })
  @Post()
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceClient.send('create_attendance', dto);
  }

  @ApiOperation({ summary: 'List all child attendance records' })
  @ApiOkResponse({ description: 'List of attendances' })
  @Get()
  findAll() {
    return this.attendanceClient.send('find_all_attendance', {});
  }

  @ApiOperation({ summary: 'Get a child attendance by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID (uuid)' })
  @ApiOkResponse({ description: 'Attendance item' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceClient.send('find_one_attendance', id);
  }

  @ApiOperation({ summary: 'Update a child attendance by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID (uuid)' })
  @ApiBody({ type: UpdateAttendanceDto })
  @ApiOkResponse({ description: 'Attendance updated' })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceClient.send('update_attendance', {
      id,
      updateAttendanceDto: dto,
    });
  }

  @ApiOperation({ summary: 'Delete a child attendance by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID (uuid)' })
  @ApiOkResponse({ description: 'Attendance deleted' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceClient.send('remove_attendance', id);
  }

  /* ─────────────────────── Children quick actions ─────────────────────── */

  @ApiOperation({ summary: 'Child check-in (today, idempotent)' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiOkResponse({ description: 'Check-in saved' })
  @Post('check-in/:childId')
  childCheckIn(@Param('childId') childId: string) {
    return this.attendanceClient.send('check_in', childId);
  }

  @ApiOperation({ summary: 'Child check-out (today, idempotent)' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiOkResponse({ description: 'Check-out saved' })
  @Post('check-out/:childId')
  childCheckOut(@Param('childId') childId: string) {
    return this.attendanceClient.send('check_out', childId);
  }

  /* ─────────────────────────── Staff attendance ────────────────────────── */

  @ApiOperation({ summary: 'Staff check-in (today, idempotent)' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiOkResponse({
    description:
      'Returns { id, staffId, date, status, checkIn, checkOut } with HH:MM times',
  })
  @Post('staff/:staffId/check-in')
  staffCheckIn(@Param('staffId') staffId: string) {
    // attendance-service should have @MessagePattern('staff_check_in')
    return this.attendanceClient.send('staff_check_in', staffId);
  }

  @ApiOperation({ summary: 'Staff check-out (today, idempotent)' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiOkResponse({
    description:
      'Returns { id, staffId, date, status, checkIn, checkOut } with HH:MM times',
  })
  @Post('staff/:staffId/check-out')
  staffCheckOut(@Param('staffId') staffId: string) {
    // attendance-service should have @MessagePattern('staff_check_out')
    return this.attendanceClient.send('staff_check_out', staffId);
  }

  @ApiOperation({ summary: 'Get staff today quick status' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiOkResponse({
    description:
      'Returns { status: "in"|"out"|null, checkIn?: "HH:MM", checkOut?: "HH:MM" }',
  })
  @Get('staff/:staffId/today')
  staffToday(@Param('staffId') staffId: string) {
    // attendance-service should have @MessagePattern('staff_today')
    return this.attendanceClient.send('staff_today', staffId);
  }
}
