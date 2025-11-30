import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CalendarService } from '../service/calendar.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { CreateBookingEventDto } from '../dto/create-booking-event.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

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

  // 🔥 From booking-service when a booking is confirmed
  @MessagePattern('create_booking_event')
  handleCreateBookingEvent(@Payload() dto: CreateBookingEventDto) {
    return this.calendarService.createEventFromBooking(dto);
  }
}
