import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Inject,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BookingStatus, CreateBookingDto } from 'apps/booking-service/src/dto/create-booking.dto';
import { UpdateBookingDto } from 'apps/booking-service/src/dto/update-booking.dto';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingGatewayController {
  constructor(@Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy) {}

  // ---------- BASIC BOOKING ENDPOINTS ----------

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingClient.send({ cmd: 'create_booking' }, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all bookings' })
  async findAll() {
    return this.bookingClient.send({ cmd: 'list_bookings' }, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string) {
    return this.bookingClient.send({ cmd: 'get_booking' }, id);
  }

  // ✅ NEW: generic update booking (PUT) – will show body in Swagger
  @Put(':id')
  @ApiOperation({ summary: 'Update a booking (any fields)' })
  @ApiBody({ type: UpdateBookingDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    // this expects a MessagePattern({ cmd: 'update_booking' }) in booking-service
    return this.bookingClient.send(
      { cmd: 'update_booking' },
      { id, dto },
    );
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a booking' })
  async confirm(@Param('id') id: string) {
    return this.bookingClient.send(
      { cmd: 'update_booking_status' },
      { id, status: 'confirmed' as BookingStatus },
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string) {
    return this.bookingClient.send(
      { cmd: 'update_booking_status' },
      { id, status: 'cancelled' as BookingStatus },
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  async remove(@Param('id') id: string) {
    return this.bookingClient.send({ cmd: 'delete_booking' }, id);
  }

  // ---------- EMAIL VIA MAILTRAP SEND API ----------

  @Post(':id/email')
  @ApiOperation({ summary: 'Send booking confirmation email (Mailtrap Send API)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          example: 'melkisaber8@gmail.com',
          description: 'Recipient email address (your real email)',
        },
        booking: {
          type: 'object',
          properties: {
            parentName: { type: 'string', example: 'Jane Doe' },
            childName: { type: 'string', example: 'Lina Doe' },
            date: { type: 'string', example: '2025-12-10' },
            time: { type: 'string', example: '10:00' },
            duration: { type: 'number', example: 30 },
            contactMethod: {
              type: 'string',
              enum: ['in-person', 'phone', 'video'],
              example: 'in-person',
            },
            purpose: {
              type: 'string',
              example: 'progress',
            },
            notes: {
              type: 'string',
              example: 'We would like to discuss language development.',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled'],
              example: 'confirmed',
            },
          },
          required: [
            'parentName',
            'childName',
            'date',
            'time',
            'duration',
            'contactMethod',
            'status',
          ],
        },
      },
      required: ['to', 'booking'],
    },
  })
  async sendBookingEmail(
    @Param('id') id: string,
    @Body()
    body: {
      to: string;
      booking: {
        parentName: string;
        childName: string;
        date: string;
        time: string;
        duration: number;
        contactMethod: 'in-person' | 'phone' | 'video';
        purpose?: string;
        notes?: string;
        status: BookingStatus;
      };
    },
  ) {
    const apiToken = process.env.MAILTRAP_API_TOKEN;
    const fromEmail =
      process.env.MAILTRAP_SENDER_EMAIL || 'hello@demomailtrap.co';

    if (!apiToken) {
      throw new InternalServerErrorException('MAILTRAP_API_TOKEN is not configured');
    }

    const { to, booking } = body;

    const subject = `Meeting Confirmation - ${booking.childName} (${new Date(
      booking.date,
    ).toLocaleDateString()})`;

    const text = `
Meeting Confirmation - ${booking.childName}

Parent: ${booking.parentName}
Child: ${booking.childName}
Date: ${booking.date}
Time: ${booking.time}
Duration: ${booking.duration} minutes
Type: ${booking.contactMethod}
Purpose: ${booking.purpose || '-'}
Status: ${booking.status.toUpperCase()}
${booking.notes ? `Notes: ${booking.notes}` : ''}

This is an automated confirmation email.
`.trim();

    const html = `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <h2>📅 Meeting Confirmation</h2>
    <p>Your meeting has been scheduled successfully.</p>
    <ul>
      <li><strong>Parent:</strong> ${booking.parentName}</li>
      <li><strong>Child:</strong> ${booking.childName}</li>
      <li><strong>Date:</strong> ${booking.date}</li>
      <li><strong>Time:</strong> ${booking.time}</li>
      <li><strong>Duration:</strong> ${booking.duration} minutes</li>
      <li><strong>Type:</strong> ${booking.contactMethod}</li>
      <li><strong>Purpose:</strong> ${booking.purpose || '-'}</li>
      <li><strong>Status:</strong> ${booking.status.toUpperCase()}</li>
      ${booking.notes ? `<li><strong>Notes:</strong> ${booking.notes}</li>` : ''}
    </ul>
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">
      This is an automated confirmation email. Please do not reply.
    </p>
  </body>
</html>
`.trim();

    const response = await fetch('https://send.api.mailtrap.io/api/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: 'SalamNest',
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        text,
        html,
        category: 'Parent Meeting',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mailtrap Send API error:', data);
      throw new InternalServerErrorException(
        data?.message || `Failed to send email (status ${response.status})`,
      );
    }

    return {
      success: true,
      messageId: data.message_id || data.id,
      apiResponse: data,
    };
  }

  @Get('email-status/:messageId')
  @ApiOperation({ summary: 'Get email status (dummy for Mailtrap)' })
  async getEmailStatus(@Param('messageId') messageId: string) {
    return {
      delivered: true,
      status: 'sent',
      timestamp: new Date().toISOString(),
      messageId,
    };
  }
}
