import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'child id (uuid or string)' })
  @IsString()
  childId: string;


  @ApiProperty({ description: 'Date YYYY-MM-DD', example: '2025-10-09' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'present | away', example: 'present' })
  @IsIn(['present', 'away'])
  status: 'present' | 'away';

  @ApiPropertyOptional({ description: 'HH:MM' })
  @IsOptional()
  @IsString()
  checkIn?: string;

  @ApiPropertyOptional({ description: 'HH:MM' })
  @IsOptional()
  @IsString()
  checkOut?: string;
}
