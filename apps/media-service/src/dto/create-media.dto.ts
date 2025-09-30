import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({ enum: ['image', 'video'] })
  @IsEnum(['image', 'video'])
  type: 'image' | 'video';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  albumId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  sharedWith?: string[];

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;
  id: string;
  url: string;
}
