import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find();
  }

  async findOne(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }
    return staff;
  }

  async create(dto: CreateStaffDto): Promise<Staff> {
    const newStaff = this.staffRepository.create(dto);
    return this.staffRepository.save(newStaff);
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }

    Object.assign(staff, dto); // fusionne les updates
    return this.staffRepository.save(staff);
  }

  async remove(id: string): Promise<void> {
    const result = await this.staffRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }
  }
}
