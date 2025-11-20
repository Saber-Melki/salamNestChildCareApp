import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'


export class CreateStaffDto {
@ApiProperty()
@IsNotEmpty()
@IsString()
firstName: string


@ApiProperty()
@IsNotEmpty()
@IsString()
lastName: string


@ApiProperty()
@IsNotEmpty()
@IsEmail()
email: string


@ApiProperty({ required: false })
@IsOptional()
@IsString()
phone?: string


@ApiProperty({ enum: ['director', 'teacher', 'assistant', 'substitute', 'admin'] })
@IsOptional()
@IsString()
role?: 'director' | 'teacher' | 'assistant' | 'substitute' | 'admin'


@ApiProperty({ required: false })
@IsOptional()
@IsString()
status?: 'active' | 'inactive' | 'on-leave'


@ApiProperty({ required: false })
@IsOptional()
@IsString()
hireDate?: string


@ApiProperty({ required: false })
@IsOptional()
@IsString()
address?: string


@ApiProperty({ required: false, type: Object })
@IsOptional()
emergencyContact?: { name?: string; phone?: string; relationship?: string }


@ApiProperty({ required: false })
@IsOptional()
certifications?: string[]


@ApiProperty({ required: false })
@IsOptional()
@IsNumber()
hourlyRate?: number


@ApiProperty({ required: false })
@IsOptional()
@IsNumber()
weeklyHours?: number


@ApiProperty({ required: false })
@IsOptional()
@IsString()
notes?: string


@ApiProperty({ required: false })
@IsOptional()
@IsString()
avatar?: string
}