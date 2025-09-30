import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { CreateBookingDto, BookingStatus } from '../dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create(dto);
    return this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ order: { date: 'ASC', time: 'ASC' } });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async delete(id: string): Promise<void> {
    await this.bookingRepository.delete(id);
  }
}
