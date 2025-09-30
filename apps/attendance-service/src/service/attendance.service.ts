import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async checkIn(childId: string) {
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    // check si déjà présent
    let attendance = await this.attendanceRepo.findOne({
      where: { childId, date: today },
    });

    if (!attendance) {
      attendance = this.attendanceRepo.create({
        childId,
        date: today,
        checkIn: new Date().toISOString(),
      });
    } else {
      attendance.checkIn = new Date().toISOString();
    }

    return this.attendanceRepo.save(attendance);
  }

  async checkOut(childId: string) {
    const today = new Date().toISOString().split('T')[0];

    let attendance = await this.attendanceRepo.findOne({
      where: { childId, date: today },
    });

    if (!attendance) {
      throw new Error(`Pas de check-in trouvé pour l’enfant ${childId} aujourd’hui`);
    }

    attendance.checkOut = new Date().toISOString();

    return this.attendanceRepo.save(attendance);
  }

  async update(id: string, dto: UpdateAttendanceDto) {
  const attendance = await this.attendanceRepo.findOne({ where: { id } })
  if (!attendance) throw new Error(`Attendance ${id} not found`)

  Object.assign(attendance, dto)

  return this.attendanceRepo.save(attendance)
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
}
