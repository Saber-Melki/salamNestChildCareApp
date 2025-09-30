import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  childId: string;

  @IsDateString()
  date: string;

  @IsString()
  status: 'present' | 'away';

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;
}
