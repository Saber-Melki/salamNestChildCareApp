import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateHealthDto {
  @ApiProperty() @IsString() child: string; // child full name
  @ApiProperty() @IsOptional() @IsString() allergies?: string;
  @ApiProperty() @IsOptional() @IsString() immunizations?: string;
  @ApiProperty() @IsOptional() @IsString() emergency?: string;
}

export class UpdateHealthDto {
  @ApiProperty() @IsOptional() @IsString() child?: string;
  @ApiProperty() @IsOptional() @IsString() allergies?: string;
  @ApiProperty() @IsOptional() @IsString() immunizations?: string;
  @ApiProperty() @IsOptional() @IsString() emergency?: string;
}

export class CreateHealthNoteDto {
  @ApiProperty() @IsString() noteType: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() date: string;
  @ApiProperty() @IsOptional() @IsString() followUp?: string;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'] })
  @IsOptional() @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ required: false, enum: ['active', 'resolved', 'pending'] })
  @IsOptional() @IsIn(['active', 'resolved', 'pending'])
  status?: 'active' | 'resolved' | 'pending';
}

export class UpdateHealthNoteDto {
  @ApiProperty() @IsOptional() @IsString() noteType?: string;
  @ApiProperty() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsOptional() @IsString() date?: string;
  @ApiProperty() @IsOptional() @IsString() followUp?: string;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'] })
  @IsOptional() @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ required: false, enum: ['active', 'resolved', 'pending'] })
  @IsOptional() @IsIn(['active', 'resolved', 'pending'])
  status?: 'active' | 'resolved' | 'pending';
}
