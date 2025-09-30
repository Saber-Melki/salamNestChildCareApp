import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../entities/shift.entity';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
  ) {}

  /** 🔎 Récupérer tous les shifts */
  async findAll(): Promise<Shift[]> {
    return await this.shiftRepo.find();
  }

  /** 🔎 Récupérer un shift par son ID */
  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftRepo.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift with id "${id}" not found`);
    }
    return shift;
  }

  /** ➕ Créer un nouveau shift */
  async create(data: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftRepo.create(data);
    return await this.shiftRepo.save(shift);
  }

  /** ✏️ Mettre à jour un shift existant */
  async update(id: string, data: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findOne(id); // 🔥 utilise findOne() (DRY)
    Object.assign(shift, data);
    return await this.shiftRepo.save(shift);
  }

  /** 🗑️ Supprimer un shift par son ID */
  async remove(id: string): Promise<void> {
    const result = await this.shiftRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shift with id "${id}" not found`);
    }
  }
}
