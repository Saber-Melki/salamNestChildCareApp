import { IsOptional, IsString, IsIn } from 'class-validator';

export class StaffQuickDto {
  @IsString()
  staffId: string;
}

export class UpdateStaffAttendanceDto {
  @IsOptional() @IsIn(['present', 'away'])
  status?: 'present' | 'away';

  @IsOptional() @IsString()
  checkIn?: string;  // HH:MM or HH:MM:SS

  @IsOptional() @IsString()
  checkOut?: string; // HH:MM or HH:MM:SS
}
