import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventEntity } from '../entities/event.entity';
import { CreateBookingEventDto } from '../dto/create-booking-event.dto';
import { google, calendar_v3 } from 'googleapis';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private calendarClient: calendar_v3.Calendar | null = null;
  private calendarId: string | null = null;

  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {
    this.initGoogleCalendar();
  }

  // ---------- GOOGLE CALENDAR SETUP ----------

  private initGoogleCalendar() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) {
      this.logger.warn(
        'Google Calendar not fully configured (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY / GOOGLE_CALENDAR_ID). External sync will be disabled.',
      );
      return;
    }

    // Convert "\n" from .env into real newlines
    const cleanedKey = privateKey.replace(/\\n/g, '\n');

    const jwt = new google.auth.JWT({
      email: clientEmail,
      key: cleanedKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendarClient = google.calendar({ version: 'v3', auth: jwt });
    this.calendarId = calendarId;

    this.logger.log('Google Calendar client initialized ✅');
  }

  /**
   * Push a local event to Google Calendar.
   * Option A: no attendees, no Meet link -> avoid service account 403 errors.
   */
  private async pushToGoogleCalendar(
    event: EventEntity,
  ): Promise<{ googleEventId?: string; meetLink?: string }> {
    if (!this.calendarClient || !this.calendarId) {
      // Google Calendar not configured
      return {};
    }

    if (!event.date || !event.time) {
      return {};
    }

    const durationMinutes = event.durationMinutes ?? 30; // fallback

    const [hours, minutes] = event.time.split(':').map((n) => parseInt(n, 10));
    const start = new Date(event.date);
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // ⚠️ IMPORTANT:
    // - We NO LONGER send attendees[] to Google
    // - We NO LONGER send conferenceData / conferenceDataVersion
    //   => avoids "forbiddenForServiceAccounts" + DWD requirement
    const requestBody: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: startIso,
        timeZone: 'Europe/Berlin',
      },
      end: {
        dateTime: endIso,
        timeZone: 'Europe/Berlin',
      },
      // Store useful data as private metadata instead of real attendees
      extendedProperties: {
        private: {
          bookingId: event.bookingId ?? '',
          contactMethod: event.contactMethod ?? '',
          parentEmail: event.parentEmail ?? '',
          organizerEmail: event.organizerEmail ?? '',
          type: event.type ?? '',
        },
      },
    };

    try {
      const res = await this.calendarClient.events.insert({
        calendarId: this.calendarId,
        requestBody,
        // ❌ DO NOT pass conferenceDataVersion here
        // conferenceDataVersion: 1,
      });

      const created = res.data;
      const googleEventId = created.id || undefined;

      // In this mode, meetLink will usually be undefined/null
      const meetLink =
        created.hangoutLink ||
        created.conferenceData?.entryPoints?.find(
          (e) => e.entryPointType === 'video',
        )?.uri;

      this.logger.log(
        `Google Calendar event created: ${googleEventId} (htmlLink=${created.htmlLink})`,
      );

      return { googleEventId, meetLink };
    } catch (err) {
      this.logger.error('Failed to create Google Calendar event', err as any);
      return {};
    }
  }

  // ---------- BASIC CRUD ----------

  async createEvent(dto: CreateEventDto): Promise<EventEntity> {
    // TypeORM create() can return Entity OR Entity[], so we guard it
    const raw = this.eventRepository.create(dto as any);

    if (Array.isArray(raw)) {
      // This should never happen for a single DTO; fail fast if it does
      this.logger.error(
        'CreateEventDto unexpectedly produced an array of events.',
      );
      throw new Error('Internal error: expected a single event, got an array.');
    }

    const event: EventEntity = raw;

    // Save in DB first
    const saved = await this.eventRepository.save(event);

    // Try to push to Google Calendar
    const { googleEventId, meetLink } = await this.pushToGoogleCalendar(saved);

    if (googleEventId || meetLink) {
      saved.googleEventId = googleEventId;
      saved.meetLink = meetLink;
      await this.eventRepository.save(saved);
    }

    return saved;
  }

  async getAllEvents(): Promise<EventEntity[]> {
    return this.eventRepository.find();
  }

  async getEventById(id: string): Promise<EventEntity | null> {
    return this.eventRepository.findOneBy({ id });
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.eventRepository.findOneBy({ id });
    if (event && event.googleEventId && this.calendarClient && this.calendarId) {
      try {
        await this.calendarClient.events.delete({
          calendarId: this.calendarId,
          eventId: event.googleEventId,
        });
      } catch (err) {
        this.logger.error('Failed to delete Google Calendar event', err as any);
      }
    }
    await this.eventRepository.delete(id);
  }

  // ---------- BOOKING ↔ CALENDAR INTEGRATION ----------

  async createEventFromBooking(
    dto: CreateBookingEventDto,
  ): Promise<EventEntity> {
    const {
      bookingId,
      parentName,
      childName,
      date,
      time,
      durationMinutes,
      contactMethod,
      description,
      location,
      parentEmail,
      teacherEmail,
    } = dto;

    const title = `Parent Meeting: ${childName}`;
    const fullDescription =
      description ||
      `Meeting with ${parentName} about ${childName}'s progress. (Source: booking ${bookingId})`;

    const eventDto: CreateEventDto = {
      title,
      type: 'meeting',
      description: fullDescription,
      location: location || (contactMethod === 'in-person' ? 'On site' : 'Online'),
      date,
      time,
      allDay: false,
      bookingId,
      parentEmail,
      organizerEmail: teacherEmail,
      contactMethod,
      durationMinutes,
    };

    return this.createEvent(eventDto);
  }
}
