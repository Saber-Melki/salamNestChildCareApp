// apps/api-gateway/src/communication/dto/send-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ required: false, enum: ['text', 'image', 'file', 'audio'], default: 'text' })
  @IsOptional()
  @IsString()
  type?: 'text' | 'image' | 'file' | 'audio';
}
