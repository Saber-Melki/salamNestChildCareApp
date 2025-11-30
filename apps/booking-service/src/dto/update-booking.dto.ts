import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'cancelled'] })
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  @IsOptional()
  status?: BookingStatus;
}
