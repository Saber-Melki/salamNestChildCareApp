import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export type EventType = 'field-trip' | 'closure' | 'meeting' | 'holiday' | 'training' | 'maintenance';

export class CreateEventDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ enum: ['field-trip','closure','meeting','holiday','training','maintenance'] }) @IsEnum(['field-trip','closure','meeting','holiday','training','maintenance']) type: EventType;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() time?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() allDay?: boolean;
}
