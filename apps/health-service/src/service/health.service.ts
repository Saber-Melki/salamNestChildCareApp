import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Health } from '../entities/health.entity';
import { HealthNote } from '../entities/health-note.entity';
import {
  CreateHealthDto,
  UpdateHealthDto,
  CreateHealthNoteDto,
  UpdateHealthNoteDto,
} from '../dto/health.dto';

// ✅ RxJS utilities to avoid EmptyError from lastValueFrom when no emission happens
import { lastValueFrom, of } from 'rxjs';
import { catchError, defaultIfEmpty, timeout } from 'rxjs/operators';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Health) private readonly healthRepo: Repository<Health>,
    @InjectRepository(HealthNote) private readonly noteRepo: Repository<HealthNote>,
    @Inject('CHILD_SERVICE') private readonly childClient: ClientProxy, // for seeding
  ) {}

  // -------- HEALTH --------
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

  // ✅ Return a payload so the microservice always emits a response
  async remove(id: string): Promise<{ success: true }> {
    await this.healthRepo.delete(id);
    return { success: true };
  }

  // -------- NOTES --------
  async createNote(healthId: string, data: CreateHealthNoteDto): Promise<HealthNote> {
    const health = await this.healthRepo.findOne({ where: { id: healthId } });
    if (!health) throw new NotFoundException(`Health record ${healthId} not found`);
    if (!data.noteType) throw new Error('noteType is required');

    const note = this.noteRepo.create({
      ...data,
      priority: (data.priority ?? 'medium') as any,
      status: (data.status ?? 'active') as any,
      health,
    });
    return this.noteRepo.save(note);
  }

  async updateNote(healthId: string, noteId: string, data: UpdateHealthNoteDto): Promise<HealthNote> {
    const note = await this.noteRepo.findOne({ where: { id: noteId }, relations: ['health'] });
    if (!note) throw new NotFoundException(`Health note ${noteId} not found`);
    if (note.health.id !== healthId) {
      throw new NotFoundException(`Note ${noteId} does not belong to health record ${healthId}`);
    }
    Object.assign(note, data);
    return this.noteRepo.save(note);
  }

  async removeNote(healthId: string, noteId: string): Promise<{ success: true }> {
    const note = await this.noteRepo.findOne({ where: { id: noteId }, relations: ['health'] });
    if (!note) throw new NotFoundException(`Health note ${noteId} not found`);
    if (note.health.id !== healthId) {
      throw new NotFoundException(`Note ${noteId} does not belong to health record ${healthId}`);
    }
    await this.noteRepo.delete(noteId);
    return { success: true };
  }

  // -------- SEED: create Health + initial Note for every child without a record --------
  async seedForAllChildren(): Promise<{ created: number; skipped: number }> {
    // ✅ Safe: prevents EmptyError and timeouts if CHILD service doesn't emit
    const children = await lastValueFrom(
      this.childClient
        .send<{ firstName: string; lastName: string }[]>('find_all_children_min', {})
        .pipe(
          timeout(8000),
          defaultIfEmpty([] as { firstName: string; lastName: string }[]),
          catchError(() => of([] as { firstName: string; lastName: string }[])),
        ),
    );

    const existing = await this.healthRepo.find();
    const existingNames = new Set(existing.map((h) => h.child));

    let created = 0;
    let skipped = 0;

    for (const c of children) {
      const fullName = `${c.firstName} ${c.lastName}`.trim();
      if (existingNames.has(fullName)) {
        skipped++;
        continue;
      }

      const health = this.healthRepo.create({
        child: fullName,
        allergies: 'None',
        immunizations: 'Up to date',
        emergency: 'N/A',
        notes: [],
      });
      const saved = await this.healthRepo.save(health);

      const initNote = this.noteRepo.create({
        noteType: 'Checkup',
        description: 'Initial medical record created.',
        date: new Date().toISOString().slice(0, 10),
        priority: 'low',
        status: 'active',
        health: saved,
      });
      await this.noteRepo.save(initNote);

      created++;
    }

    return { created, skipped };
  }
}
