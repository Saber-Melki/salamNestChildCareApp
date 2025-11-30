// booking-service/src/service/booking.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { CreateBookingDto, BookingStatus } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly config: ConfigService,
  ) {}

  // ---------- BASIC CRUD ----------

  async create(dto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create(dto);
    return this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ order: { date: 'ASC', time: 'ASC' } });
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    Object.assign(booking, dto);
    return this.bookingRepository.save(booking);
  }

  // ✅ find by id
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async delete(id: string): Promise<void> {
    await this.bookingRepository.delete(id);
  }

  // ---------- RESEND EMAIL INTEGRATION ----------

  private get resendApiKey(): string {
    const key = this.config.get<string>('RESEND_API_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'RESEND_API_KEY is not configured in environment variables',
      );
    }
    return key;
  }

  private get fromEmail(): string {
    // e.g. "Childcare <no-reply@salamnest.app>"
    return (
      this.config.get<string>('RESEND_FROM_EMAIL') ||
      'Childcare <no-reply@example.com>'
    );
  }

  // Format booking details into HTML email (adapted from your frontend)
  private buildBookingEmailHtml(booking: Booking): string {
    const meetingType =
      booking.contactMethod === 'in-person'
        ? 'In Person Meeting'
        : booking.contactMethod === 'phone'
        ? 'Phone Call'
        : 'Video Conference';

    const dateLabel = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px;
          }
          .detail-row { 
            background: #f9fafb; 
            padding: 16px 20px; 
            margin: 12px 0; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
            display: flex;
            align-items: start;
          }
          .detail-icon {
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
          }
          .detail-content {
            flex: 1;
          }
          .detail-label { 
            font-weight: 600; 
            color: #667eea; 
            margin-bottom: 4px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-value { 
            color: #1f2937;
            font-size: 16px;
            font-weight: 500;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #6b7280; 
            font-size: 14px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 8px 0;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 8px;
          }
          .status-confirmed {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Confirmation</h1>
            <p>Your meeting has been scheduled successfully!</p>
          </div>
          <div class="content">
            <div class="detail-row">
              <div class="detail-icon">👨‍👩‍👧</div>
              <div class="detail-content">
                <div class="detail-label">Parent Name</div>
                <div class="detail-value">${booking.parentName}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">👶</div>
              <div class="detail-content">
                <div class="detail-label">Child Name</div>
                <div class="detail-value">${booking.childName}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Date</div>
                <div class="detail-value">${dateLabel}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">🕐</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Time</div>
                <div class="detail-value">${booking.time}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">⏱️</div>
              <div class="detail-content">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${booking.duration} minutes</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">📱</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Type</div>
                <div class="detail-value">${meetingType}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">📝</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Purpose</div>
                <div class="detail-value">${booking.purpose || '-'}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">✅</div>
              <div class="detail-content">
                <div class="detail-label">Booking Status</div>
                <div class="detail-value">
                  <span class="status-badge status-${booking.status}">
                    ${booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            ${
              booking.notes
                ? `
            <div class="detail-row">
              <div class="detail-icon">💬</div>
              <div class="detail-content">
                <div class="detail-label">Additional Notes</div>
                <div class="detail-value">${booking.notes}</div>
              </div>
            </div>
            `
                : ''
            }
          </div>
          <div class="footer">
            <p><strong>📧 This is an automated confirmation email.</strong></p>
            <p>Please do not reply to this message.</p>
          </div>
        </div>
      </body>
    </html>
    `;
  }

  private buildBookingEmailText(booking: Booking): string {
    const dateLabel = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const meetingType =
      booking.contactMethod === 'in-person'
        ? 'In Person Meeting'
        : booking.contactMethod === 'phone'
        ? 'Phone Call'
        : 'Video Conference';

    return `
Meeting Confirmation - ${booking.childName}

Your meeting has been scheduled successfully!

BOOKING DETAILS:
================
Parent Name: ${booking.parentName}
Child Name: ${booking.childName}
Date: ${dateLabel}
Time: ${booking.time}
Duration: ${booking.duration} minutes
Meeting Type: ${meetingType}
Purpose: ${booking.purpose || '-'}
Status: ${booking.status.toUpperCase()}
${booking.notes ? `Notes: ${booking.notes}` : ''}

WHAT TO EXPECT:
===============
- Please arrive 5 minutes early for in-person meetings
- For video calls, a link will be sent separately
- Feel free to bring any questions or concerns
- If you need to reschedule, please contact us at least 24 hours in advance

---
This is an automated confirmation email. Please do not reply.
`;
  }

  // ---------- PUBLIC EMAIL METHODS (used by controller / gateway) ----------

  async sendBookingEmail(
    bookingId: string,
    recipientEmail: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const booking = await this.findOne(bookingId);

    try {
      // Node 18+ has global fetch. If TS complains, you can import 'node-fetch'
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.resendApiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: recipientEmail,
          subject: `Meeting Confirmation - ${booking.childName} (${booking.date})`,
          html: this.buildBookingEmailHtml(booking),
          text: this.buildBookingEmailText(booking),
        }),
      } as any);

      const data = await res.json();

      if (!res.ok) {
        console.error('Resend API error:', data);
        return {
          success: false,
          error: data?.message || `Email send failed with status ${res.status}`,
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to send email',
      };
    }
  }

  async verifyEmailDelivery(
    messageId: string,
  ): Promise<{ delivered: boolean; status: string; timestamp?: string }> {
    try {
      const res = await fetch(`https://api.resend.com/emails/${messageId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
        },
      } as any);

      if (!res.ok) {
        console.error('Resend verify error status:', res.status);
        return {
          delivered: false,
          status: 'unknown',
        };
      }

      const data = await res.json();

      return {
        delivered: data.last_event === 'delivered',
        status: data.last_event || 'sent',
        timestamp: data.created_at,
      };
    } catch (error) {
      console.error('Email verify error:', error);
      return {
        delivered: false,
        status: 'unknown',
      };
    }
  }
}
