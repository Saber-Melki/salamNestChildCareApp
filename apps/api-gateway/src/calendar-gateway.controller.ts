import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CreateEventDto } from 'apps/calendar-service/src/dto/create-event.dto';
import { CreateBookingEventDto } from 'apps/calendar-service/src/dto/create-booking-event.dto';

@ApiTags('calendar-gateway')
@Controller('calendar')
export class CalendarGatewayController {
  constructor(
    @Inject('CALENDAR_SERVICE')
    private readonly calendarClient: ClientProxy,
  ) {}

  // ------------------- EVENTS (generic) -------------------

  @Post('events')
  @ApiOperation({
    summary: 'Create a calendar event',
    description:
      'Creates a generic event in the calendar-service (optionally synced to Google Calendar).',
  })
  async createEvent(@Body() dto: CreateEventDto) {
    return this.calendarClient.send('create_event', dto);
  }

  @Get('events')
  @ApiOperation({
    summary: 'List all events',
    description: 'Returns all events stored in the calendar-service.',
  })
  async findAllEvents() {
    return this.calendarClient.send('find_all_events', {});
  }

  @Get('events/:id')
  @ApiOperation({
    summary: 'Get one event by ID',
    description: 'Returns a single event by its ID.',
  })
  async findEvent(@Param('id') id: string) {
    return this.calendarClient.send('find_event', id);
  }

  @Delete('events/:id')
  @ApiOperation({
    summary: 'Delete an event',
    description:
      'Deletes an event in the calendar-service (and removes it from Google Calendar if linked).',
  })
  async removeEvent(@Param('id') id: string) {
    return this.calendarClient.send('remove_event', id);
  }

  // ------------------- BOOKING → CALENDAR -------------------

  @Post('booking-events')
  @ApiOperation({
    summary: 'Create event from booking',
    description:
      'Used to convert a confirmed booking into a calendar event (with optional Google Calendar + Meet link).',
  })
  async createBookingEvent(@Body() dto: CreateBookingEventDto) {
    // This sends RMQ message "create_booking_event" to calendar-service
    return this.calendarClient.send('create_booking_event', dto);
  }
}
