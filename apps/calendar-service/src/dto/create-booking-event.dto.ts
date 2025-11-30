import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsIn,
  IsEmail,
} from 'class-validator';

export class CreateBookingEventDto {
  @ApiProperty({ description: 'Booking ID from booking-service' })
  @IsString()
  bookingId: string;

  @ApiProperty({ description: 'Parent full name' })
  @IsString()
  parentName: string;

  @ApiProperty({ description: 'Child full name' })
  @IsString()
  childName: string;

  @ApiProperty({ description: 'ISO date, e.g. 2025-12-10' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Time (HH:mm)', example: '10:00' })
  @IsString()
  time: string;

  @ApiProperty({ description: 'Duration in minutes', example: 30 })
  @IsInt()
  @Min(5)
  durationMinutes: number;

  @ApiProperty({
    description: 'Meeting type (in-person, phone, video)',
    enum: ['in-person', 'phone', 'video'],
  })
  @IsIn(['in-person', 'phone', 'video'])
  contactMethod: 'in-person' | 'phone' | 'video';

  @ApiProperty({ required: false, description: 'Short description/purpose' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Location if in-person' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, description: 'Parent email (attendee)' })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @ApiProperty({ required: false, description: 'Teacher/staff email (organizer)' })
  @IsOptional()
  @IsEmail()
  teacherEmail?: string;
}
