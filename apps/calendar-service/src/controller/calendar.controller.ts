import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';

import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CalendarService } from '../service/calendar.service';
import { CreateEventDto } from '../dto/create-event.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

// HTTP REST endpoints
@MessagePattern('create_event')
handleCreateEvent(@Payload() dto: CreateEventDto) {
  return this.calendarService.createEvent(dto);
}

@MessagePattern('find_all_events')
handleListEvents() {
  return this.calendarService.getAllEvents();
}

@MessagePattern('find_event')
handleGetEvent(@Payload() id: string) {
  return this.calendarService.getEventById(id);
}

@MessagePattern('remove_event')
handleDeleteEvent(@Payload() id: string) {
  return this.calendarService.deleteEvent(id);
}

}
