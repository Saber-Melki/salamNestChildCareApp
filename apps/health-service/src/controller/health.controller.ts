import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateHealthDto, UpdateHealthDto, CreateHealthNoteDto, UpdateHealthNoteDto } from '../dto/health.dto';
import { HealthService } from '../service/health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

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
    return this.healthService.remove(id);
  }

  // Notes
  @MessagePattern('create_health_note')
  createNote(@Payload() data: CreateHealthNoteDto) {
    return this.healthService.createNote(data);
  }

  @MessagePattern('update_health_note')
  updateNote(@Payload() data: { id: string; dto: UpdateHealthNoteDto }) {
    return this.healthService.updateNote(data.id, data.dto);
  }

  @MessagePattern('remove_health_note')
  removeNote(@Payload() id: string) {
    return this.healthService.removeNote(id);
  }
}
