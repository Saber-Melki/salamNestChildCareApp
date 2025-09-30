import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type ContactMethod = 'in-person' | 'phone' | 'video';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parentName: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  childName: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  time: string;

  @ApiProperty()
  @IsInt()
  duration: number;

  @ApiProperty()
  @IsEnum(['in-person', 'phone', 'video'])
  contactMethod: ContactMethod;

  @ApiProperty()
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes?: string;
}
