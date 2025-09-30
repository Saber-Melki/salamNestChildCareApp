import { Controller, Post, Get, Delete, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BookingStatus, CreateBookingDto } from 'apps/booking-service/src/dto/create-booking.dto';

@Controller('bookings')
export class BookingGatewayController {
  constructor(@Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingClient.send({ cmd: 'create_booking' }, dto);
  }

  @Get()
  async findAll() {
    return this.bookingClient.send({ cmd: 'list_bookings' }, {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Optionnel, si tu implémentes un message pattern pour récupérer 1 booking
    return this.bookingClient.send({ cmd: 'get_booking' }, id);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.bookingClient.send({ cmd: 'update_booking_status' }, { id, status: 'confirmed' as BookingStatus });
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.bookingClient.send({ cmd: 'update_booking_status' }, { id, status: 'cancelled' as BookingStatus });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookingClient.send({ cmd: 'delete_booking' }, id);
  }
}
