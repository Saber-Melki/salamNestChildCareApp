// apps/api-gateway/src/dto/send-booking-email.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendBookingEmailDto {
  @ApiProperty({
    example: 'parent@example.com',
    description: 'Email address of the recipient (parent)',
  })
  @IsEmail()
  recipientEmail: string;
}
