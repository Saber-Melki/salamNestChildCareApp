import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Invoice)
    private readonly invRepo: Repository<Invoice>,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');

    this.stripe = new Stripe(key, {
      // apiVersion optional; will use account default if omitted
      // apiVersion: '2024-04-10',
    });
  }

  async createCheckoutSession(invoiceId: string) {
    const invoice = await this.invRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const appUrl =
      this.config.get<string>('APP_PUBLIC_URL') || 'http://localhost:3000';

    const lineItemsSource =
      invoice.items?.length && invoice.items.length > 0
        ? invoice.items
        : [{ description: 'Invoice', amount: Number(invoice.amount) }];

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel?invoice=${invoiceId}`,
      metadata: { invoiceId },
      line_items: lineItemsSource.map((it) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: it.description },
          unit_amount: Math.round(Number(it.amount) * 100),
        },
        quantity: 1,
      })),
    });

    return {
      sessionId: session.id,
      url: session.url, // nice to have for redirect from frontend
    };
  }

  async handleWebhook(signature: string | undefined, rawBody: Buffer) {
    const whSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!whSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature ?? '',
      whSecret,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoiceId;
      if (invoiceId) {
        const inv = await this.invRepo.findOne({ where: { id: invoiceId } });
        if (inv) {
          inv.status = 'paid';
          await this.invRepo.save(inv);
        }
      }
    }

    return { received: true };
  }
}
