import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsEmail,
  IsInt,
  Min,
} from 'class-validator';

export type EventType =
  | 'field-trip'
  | 'closure'
  | 'meeting'
  | 'holiday'
  | 'training'
  | 'maintenance';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    enum: ['field-trip', 'closure', 'meeting', 'holiday', 'training', 'maintenance'],
  })
  @IsEnum(['field-trip', 'closure', 'meeting', 'holiday', 'training', 'maintenance'] as any)
  type: EventType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, description: 'ISO date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, description: 'Time (HH:mm)' })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  // link to booking
  @ApiProperty({ required: false, description: 'Booking ID if this event comes from a booking' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  // meeting type
  @ApiProperty({
    required: false,
    description: 'Meeting type (in-person, phone, video)',
    enum: ['in-person', 'phone', 'video'],
  })
  @IsOptional()
  @IsString()
  contactMethod?: 'in-person' | 'phone' | 'video';

  // attendees
  @ApiProperty({ required: false, description: 'Parent email' })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @ApiProperty({ required: false, description: 'Teacher/staff email (organizer)' })
  @IsOptional()
  @IsEmail()
  organizerEmail?: string;

  // duration (to compute end time for Google Calendar)
  @ApiProperty({ required: false, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(5)
  durationMinutes?: number;
}
