import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';


class InvoiceItemDto {
@ApiProperty({ example: 'Monthly Tuition' })
@IsString()
@IsNotEmpty()
description: string;


@ApiProperty({ example: 800 })
@IsNumber()
amount: number;
}


export class CreateInvoiceDto {
@ApiProperty({ example: 'INV-1023' })
@IsOptional()
@IsString()
id?: string;


@ApiProperty({ example: 'Said Family' })
@IsString()
@IsNotEmpty()
family: string;


@ApiProperty({ type: [InvoiceItemDto] })
@IsArray()
@ValidateNested({ each: true })
@Type(() => InvoiceItemDto)
items: InvoiceItemDto[];


@ApiProperty({ example: '2025-09-30' })
@IsString()
dueDate: string;


@ApiProperty({ required: false })
@IsOptional()
@IsString()
notes?: string;
}