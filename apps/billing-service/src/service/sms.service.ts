import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: Twilio;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !this.fromNumber) {
      this.logger.warn(
        'Twilio env vars are missing – SMS sending will be disabled.',
      );
    }

    this.client = new Twilio(accountSid ?? '', authToken ?? '');
  }

  async sendOverdueReminder(to: string, body: string) {
    if (!this.client || !this.fromNumber || !to) {
      this.logger.warn(
        `Skipping SMS, missing config or phone number. to=${to}`,
      );
      return;
    }

    try {
      const msg = await this.client.messages.create({
        from: this.fromNumber,
        to,
        body,
      });
      this.logger.log(`Sent overdue reminder SMS to ${to} (sid=${msg.sid})`);
    } catch (err) {
      this.logger.error(
        `Failed to send overdue reminder SMS to ${to}: ${err}`,
      );
    }
  }
}
