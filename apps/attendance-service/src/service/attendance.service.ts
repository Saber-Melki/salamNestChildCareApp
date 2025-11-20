import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { AttendanceEntity } from '../entities/attendance.entity';
import { StaffAttendanceEntity } from '../entities/staff-attendance.entity';

/* ----------------------------- Helpers ----------------------------- */

function toDateYMD(d: string): string {
  // expects ISO date-like "YYYY-MM-DD"
  return d?.slice(0, 10);
}

function toTimeHMS(t?: string): string | undefined {
  if (!t) return undefined;
  // Accept "HH:mm" or "HH:mm:ss"
  const parts = t.split(':');
  if (parts.length === 2) return `${t}:00`;
  if (parts.length === 3) return t;
  return undefined; // invalid; add stronger validation if you prefer
}

function nowHMS(): string {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ----------------------------- Types ------------------------------ */

type StaffTodayResponse = {
  status: 'in' | 'out' | null;
  checkIn?: string;
  checkOut?: string;
};

/* --------------------------- Service --------------------------- */

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepo: Repository<AttendanceEntity>,

    // Staff attendance repo
    @InjectRepository(StaffAttendanceEntity)
    private readonly staffAttRepo: Repository<StaffAttendanceEntity>,
  ) {}

  // ---- CREATE (used by POST /attendance via gateway) ----
  async create(dto: CreateAttendanceDto) {
    const entity = this.attendanceRepo.create({
      childId: dto.childId,
      date: toDateYMD(dto.date),
      status: dto.status, // 'present' | 'away'
      checkIn: toTimeHMS(dto.checkIn),
      checkOut: toTimeHMS(dto.checkOut),
    });
    return this.attendanceRepo.save(entity);
  }

  // ---- CHECK-IN / CHECK-OUT for CHILDREN ----
  async checkIn(childId: string) {
    const today = todayYMD();

    let attendance = await this.attendanceRepo.findOne({
      where: { childId, date: today },
    });

    if (!attendance) {
      attendance = this.attendanceRepo.create({
        childId,
        date: today,
        status: 'present',
        checkIn: nowHMS(),
      });
    } else {
      attendance.status = 'present';
      attendance.checkIn = nowHMS();
    }

    return this.attendanceRepo.save(attendance);
  }

  async checkOut(childId: string) {
    const today = todayYMD();

    const attendance = await this.attendanceRepo.findOne({
      where: { childId, date: today },
    });

    if (!attendance) {
      throw new NotFoundException(`No check-in found for child ${childId} today`);
    }

    attendance.checkOut = nowHMS();
    return this.attendanceRepo.save(attendance);
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException(`Attendance ${id} not found`);

    if (dto.date) attendance.date = toDateYMD(dto.date);
    if (dto.status) attendance.status = dto.status;
    if (dto.checkIn !== undefined) attendance.checkIn = toTimeHMS(dto.checkIn);
    if (dto.checkOut !== undefined) attendance.checkOut = toTimeHMS(dto.checkOut);
    if (dto.childId) attendance.childId = dto.childId;

    return this.attendanceRepo.save(attendance);
  }

  async findAll() {
    return this.attendanceRepo.find();
  }

  async findOne(id: string) {
    return this.attendanceRepo.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.attendanceRepo.delete(id);
  }

  /* ===================== STAFF ATTENDANCE (NEW) ===================== */

  /** Idempotent staff check-in for today. */
 async staffCheckIn(staffId: string) {
  const date = todayYMD();

  let att = await this.staffAttRepo.findOne({ where: { staffId, date } });

  if (!att) {
    // First mark of the day: start with checkout null
    att = this.staffAttRepo.create({
      staffId,
      date,
      status: 'present',
      checkIn: nowHMS(),
      checkOut: null, // ensure it starts null
    });
  } else {
    // New check-in in the same day => start a new session on the same row
    att.status = 'present';
    att.checkIn = nowHMS();
    att.checkOut = null; // << reset checkout so it "starts null"
  }

  const saved = await this.staffAttRepo.save(att);

  return {
    id: saved.id,
    staffId: saved.staffId,
    date: saved.date,
    status: saved.status,
    checkIn: saved.checkIn?.slice(0, 5),
    checkOut: saved.checkOut ? saved.checkOut.slice(0, 5) : undefined,
  };
}


  /** Idempotent staff check-out for today (requires prior check-in). */
  async staffCheckOut(staffId: string) {
    const date = todayYMD();

    const att = await this.staffAttRepo.findOne({ where: { staffId, date } });
    if (!att) {
      throw new NotFoundException(`No check-in found for staff ${staffId} on ${date}`);
    }

    if (!att.checkOut) att.checkOut = nowHMS();

    const saved = await this.staffAttRepo.save(att);

    return {
      id: saved.id,
      staffId: saved.staffId,
      date: saved.date,
      status: saved.status,
      checkIn: saved.checkIn?.slice(0, 5),
      checkOut: saved.checkOut?.slice(0, 5),
    };
  }

  /** Quick "today" status for a staff member. */
  async staffToday(staffId: string): Promise<StaffTodayResponse> {
    const date = todayYMD();
    const att = await this.staffAttRepo.findOne({ where: { staffId, date } });
    if (!att) return { status: null };
    return {
      status: att.checkOut ? 'out' : 'in',
      checkIn: att.checkIn?.slice(0, 5),
      checkOut: att.checkOut?.slice(0, 5),
    };
    }
}
