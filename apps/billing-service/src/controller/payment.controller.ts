import { Body, Controller, Get, Param, Post, Req, Res, Headers } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { Response, Request } from 'express';

@Controller('billing/pay')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @Post('checkout/:invoiceId')
  async createCheckout(@Param('invoiceId') invoiceId: string) {
    return this.payments.createCheckoutSession(invoiceId);
  }

  // Stripe webhook endpoint
  @Post('stripe/webhook')
  async stripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.payments.handleWebhook(sig, (req as any).rawBody);
    return res.status(200).send({ ok: true });
  }

  @Get('health')
  ok() {
    return { ok: true };
  }
}
