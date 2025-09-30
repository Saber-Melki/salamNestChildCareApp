import { Controller, Post, Get, Delete, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateEventDto } from 'apps/calendar-service/src/dto/create-event.dto';


@Controller('calendar')
export class CalendarGatewayController {
  constructor(
    @Inject('CALENDAR_SERVICE') private readonly calendarClient: ClientProxy
  ) {}

  // ------------------- EVENTS -------------------

  @Post('events')
  async createEvent(@Body() dto: CreateEventDto) {
    return this.calendarClient.send('create_event', dto);
  }

  @Get('events')
  async findAllEvents() {
    return this.calendarClient.send('find_all_events', {});
  }

  @Get('events/:id')
  async findEvent(@Param('id') id: string) {
    return this.calendarClient.send('find_event', id);
  }

  @Delete('events/:id')
  async removeEvent(@Param('id') id: string) {
    return this.calendarClient.send('remove_event', id);
  }
  
}
