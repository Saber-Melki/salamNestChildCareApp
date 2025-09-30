import { Controller, Body, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingService } from '../service/booking.service';
import { CreateBookingDto, BookingStatus } from '../dto/create-booking.dto';
import { Booking } from '../entities/booking.entity';

@ApiTags('bookings')
@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // 🌐 RabbitMQ handlers
  @MessagePattern({ cmd: 'create_booking' })
  createBooking(@Payload() dto: CreateBookingDto): Promise<Booking> {
    return this.bookingService.create(dto);
  }

  @MessagePattern({ cmd: 'update_booking_status' })
  updateBooking(@Payload() payload: { id: string; status: BookingStatus }): Promise<Booking> {
    return this.bookingService.updateStatus(payload.id, payload.status);
  }

  @MessagePattern({ cmd: 'delete_booking' })
  deleteBooking(@Payload() id: string) {
    return this.bookingService.delete(id).then(() => ({ success: true }));
  }

  @MessagePattern({ cmd: 'list_bookings' })
  listBookings(): Promise<Booking[]> {
    return this.bookingService.findAll();
  }
}
