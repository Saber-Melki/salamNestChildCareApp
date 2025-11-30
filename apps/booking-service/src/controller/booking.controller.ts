// booking-service/src/controller/booking.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingService } from '../service/booking.service';
import { CreateBookingDto, BookingStatus } from '../dto/create-booking.dto';
import { Booking } from '../entities/booking.entity';
import { UpdateBookingDto } from '../dto/update-booking.dto';

@ApiTags('bookings')
@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern({ cmd: 'create_booking' })
  createBooking(@Payload() dto: CreateBookingDto): Promise<Booking> {
    return this.bookingService.create(dto);
  }

  // 🔹 Status-only update (confirm/cancel)
  @MessagePattern({ cmd: 'update_booking_status' })
  updateBookingStatus(
    @Payload() payload: { id: string; status: BookingStatus },
  ): Promise<Booking> {
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

  // ✅ get by id
  @MessagePattern({ cmd: 'get_booking' })
  getBooking(@Payload() id: string): Promise<Booking> {
    return this.bookingService.findOne(id);
  }

  
  @MessagePattern({ cmd: 'update_booking' })
  updateBooking(
    @Payload() payload: { id: string; dto: UpdateBookingDto },
  ): Promise<Booking> {
    return this.bookingService.update(payload.id, payload.dto);
  }
}
