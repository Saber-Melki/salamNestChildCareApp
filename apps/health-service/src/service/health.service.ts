import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Health } from '../entities/health.entity';
import { HealthNote } from '../entities/health-note.entity';
import { CreateHealthDto, UpdateHealthDto, CreateHealthNoteDto, UpdateHealthNoteDto } from '../dto/health.dto';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Health)
    private readonly healthRepo: Repository<Health>,
    @InjectRepository(HealthNote)
    private readonly noteRepo: Repository<HealthNote>,
  ) {}

  findAll(): Promise<Health[]> {
    return this.healthRepo.find({ relations: ['notes'] });
  }

  findOne(id: string): Promise<Health> {
    return this.healthRepo.findOne({ where: { id }, relations: ['notes'] });
  }

  create(data: CreateHealthDto): Promise<Health> {
    const health = this.healthRepo.create(data);
    return this.healthRepo.save(health);
  }

  async update(id: string, data: UpdateHealthDto): Promise<Health> {
    const health = await this.healthRepo.findOne({ where: { id } });
    if (!health) throw new NotFoundException(`Health record ${id} not found`);
    Object.assign(health, data);
    return this.healthRepo.save(health);
  }

  async remove(id: string): Promise<void> {
    await this.healthRepo.delete(id);
  }

  // Health Notes
  async createNote(data: CreateHealthNoteDto): Promise<HealthNote> {
    const health = await this.healthRepo.findOne({ where: { id: data.healthId } });
    if (!health) throw new NotFoundException(`Health record ${data.healthId} not found`);

    const note = this.noteRepo.create({ ...data, health });
    return this.noteRepo.save(note);
  }

  async updateNote(id: string, data: UpdateHealthNoteDto): Promise<HealthNote> {
    const note = await this.noteRepo.findOne({ where: { id }, relations: ['health'] });
    if (!note) throw new NotFoundException(`Health note ${id} not found`);

    Object.assign(note, data);
    return this.noteRepo.save(note);
  }

  async removeNote(id: string): Promise<void> {
    await this.noteRepo.delete(id);
  }
}
