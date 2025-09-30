// apps/calendar-service/src/service/calendar.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventEntity } from '../entities/event.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<EventEntity> {
    const event = this.eventRepository.create(dto);
    return this.eventRepository.save(event);
  }

  async getAllEvents(): Promise<EventEntity[]> {
    return this.eventRepository.find();
  }

  async getEventById(id: string): Promise<EventEntity | null> {
    return this.eventRepository.findOneBy({ id });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.eventRepository.delete(id);
  }
}
