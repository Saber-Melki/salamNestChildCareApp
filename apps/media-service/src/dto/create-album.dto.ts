import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class AlbumDto {
  @ApiProperty({ description: 'Name of the album' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the album', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the album is public', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
  itemCount: any;
  id: string;

}
