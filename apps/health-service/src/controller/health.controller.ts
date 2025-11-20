import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HealthService } from '../service/health.service';
import {
  CreateHealthDto,
  UpdateHealthDto,
  CreateHealthNoteDto,
  UpdateHealthNoteDto,
} from '../dto/health.dto';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // Health
  @MessagePattern('find_all_health')
  findAll() {
    return this.healthService.findAll();
  }

  @MessagePattern('find_one_health')
  findOne(@Payload() id: string) {
    return this.healthService.findOne(id);
  }

  @MessagePattern('create_health')
  create(@Payload() data: CreateHealthDto) {
    return this.healthService.create(data);
  }

  @MessagePattern('update_health')
  update(@Payload() data: { id: string; dto: UpdateHealthDto }) {
    return this.healthService.update(data.id, data.dto);
  }

  @MessagePattern('remove_health')
  remove(@Payload() id: string) {
    return this.healthService.remove(id); // returns { success: true }
  }

  // Notes
  @MessagePattern('create_health_note')
  createNote(@Payload() data: { healthId: string; note: CreateHealthNoteDto }) {
    return this.healthService.createNote(data.healthId, data.note);
  }

  @MessagePattern('update_health_note')
  updateNote(@Payload() data: { healthId: string; noteId: string; note: UpdateHealthNoteDto }) {
    return this.healthService.updateNote(data.healthId, data.noteId, data.note);
  }

  @MessagePattern('delete_health_note')
  removeNote(@Payload() data: { healthId: string; noteId: string }) {
    return this.healthService.removeNote(data.healthId, data.noteId); // returns { success: true }
  }

  // Seed: create records + initial note for every child
  @MessagePattern('seed_health_for_all_children')
  seedHealthForAll() {
    return this.healthService.seedForAllChildren();
  }
}
