import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';
export class CreateHealthDto {
  @ApiProperty()
  @IsString()
  child: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  immunizations?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  emergency?: string;
}

export class UpdateHealthDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  child?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  immunizations?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  emergency?: string;
}

export class CreateHealthNoteDto {
  @ApiProperty()
  @IsString()
  noteType: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  followUp?: string;
  healthId: string;
}

export class UpdateHealthNoteDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  noteType?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  followUp?: string;
}
