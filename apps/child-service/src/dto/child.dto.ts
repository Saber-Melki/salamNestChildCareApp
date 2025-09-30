import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateChildDto {
  @ApiProperty({ example: 'Mia', description: 'First name of the child' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Chen', description: 'Last name of the child' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Chen', description: 'Family name' })
  @IsString()
  family: string;

  @ApiProperty({ example: 1, description: 'Number of authorized pickups' })
  @IsInt()
  authorizedPickups: number;

  @ApiProperty({ example: 'Dairy', description: 'Allergies if any' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ example: 5, description: 'Age of the child' })
  @IsInt()
  age: number;

  @ApiProperty({ example: 'Sunflowers', description: 'Group name' })
  @IsString()
  group: string;

  @ApiProperty({ example: 'Li Chen', description: 'Emergency contact name' })
  @IsString()
  emergencyContact: string;

  @ApiProperty({ example: '(555) 345-6789', description: 'Emergency contact phone' })
  @IsString()
  emergencyPhone: string;

  @ApiProperty({ example: 'li@chen.com', description: 'Parent email' })
  @IsString()
  parentEmail: string;

  @ApiProperty({ example: 'Quiet and thoughtful', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateChildDto extends PartialType(CreateChildDto) {}
