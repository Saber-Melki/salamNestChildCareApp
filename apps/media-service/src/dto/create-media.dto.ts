import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { MediaType } from '../entities/media.entity';

export class CreateMediaDto {
  // We infer type (image/video) from file mimetype, so make it optional
  @ApiProperty({ enum: MediaType, required: false })
  @IsOptional()
  type?: MediaType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  albumId: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  sharedWith?: string[];
}
