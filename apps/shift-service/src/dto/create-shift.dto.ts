import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  staff: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  end: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ required: false })
  @IsString()
  notes?: string;
}
