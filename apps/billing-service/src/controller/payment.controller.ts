import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../service/payment.service';
import { Response, Request } from 'express';

@ApiTags('payments')
@Controller('billing/pay')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @ApiOperation({
    summary: 'Create Stripe Checkout session for an invoice',
    description:
      'Returns a Stripe Checkout sessionId and url for redirecting the user.',
  })
  @ApiParam({ name: 'invoiceId', type: String })
  @Post('checkout/:invoiceId')
  async createCheckout(@Param('invoiceId') invoiceId: string) {
    return this.payments.createCheckoutSession(invoiceId);
  }

  @ApiOperation({
    summary: 'Stripe webhook endpoint',
    description:
      'Receives Stripe events (e.g. checkout.session.completed) and updates invoices.',
  })
  @Post('stripe/webhook')
  async stripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.payments.handleWebhook(sig, (req as any).rawBody);
    return res.status(200).send({ ok: true });
  }

  @ApiOperation({ summary: 'Healthcheck for billing/pay' })
  @Get('health')
  ok() {
    return { ok: true };
  }
}
