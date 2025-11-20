// apps/api-gateway/src/communication/dto/create-thread.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDmThreadDto {
  @ApiProperty({ description: 'User ID of the person you want to chat with' })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
