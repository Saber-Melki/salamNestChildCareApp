import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStaffDto {
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
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShiftDto extends CreateStaffDto {}

// ✅ Nouveau DTO pour mettre à jour un Staff (tous les champs deviennent optionnels)
export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
