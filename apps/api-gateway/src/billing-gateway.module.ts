import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Inject,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { CreateInvoiceDto } from 'apps/billing-service/src/dto/create-invoice.dto';

@Controller('billing')
export class BillingGatewayController {
  constructor(
    @Inject('BILLING_SERVICE')
    private readonly billingClient: ClientProxy,
  ) {}

  /* ───────────────────────────
   *   INVOICE CRUD
   * ─────────────────────────── */
  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.billingClient.send('billing.createInvoice', dto);
  }

  @Get()
  findAll() {
    return this.billingClient.send('billing.listInvoices', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billingClient.send('billing.getInvoice', id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billingClient.send('billing.deleteInvoice', id);
  }

  @Post(':id/paid')
  markPaid(@Param('id') id: string) {
    return this.billingClient.send('billing.markPaid', { id });
  }

  @Post('remind/overdue')
  remindOverdue() {
    return this.billingClient.send('billing.remindOverdue', {});
  }

  /* ───────────────────────────
   *   STRIPE PAYMENT
   * ─────────────────────────── */

  /**
   * Create Stripe Checkout Session
   * Frontend calls:
   *   POST /billing/pay/checkout/:invoiceId
   */
  @Post('pay/checkout/:invoiceId')
  async createStripeCheckout(@Param('invoiceId') invoiceId: string) {
    return this.billingClient.send('billing.pay.createCheckout', { invoiceId });
  }

  /**
   * OPTIONAL: Forward Stripe webhook to billing service
   * If you want gateway to receive webhooks, you need:
   * - rawBody support in main.ts of the gateway
   */
  @Post('pay/stripe/webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.billingClient
      .send('billing.pay.webhook', {
        signature,
        rawBody: (req as any).rawBody,
      })
      .toPromise();

    return res.status(200).send({ ok: true });
  }
}
