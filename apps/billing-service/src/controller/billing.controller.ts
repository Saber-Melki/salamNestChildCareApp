import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BillingService } from '../service/billing.service';
import { PaymentService } from '../service/payment.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';

@Controller()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly paymentService: PaymentService,
  ) {}

  /*────────────────────────────────────
   * INVOICE CRUD
   *────────────────────────────────────*/

  @MessagePattern('billing.createInvoice')
  create(@Payload() dto: CreateInvoiceDto) {
    return this.billingService.create(dto);
  }

  @MessagePattern('billing.listInvoices')
  findAll() {
    return this.billingService.findAll();
  }

  @MessagePattern('billing.getInvoice')
  findOne(@Payload() id: string) {
    return this.billingService.findOne(id);
  }

  @MessagePattern('billing.deleteInvoice')
  remove(@Payload() id: string) {
    return this.billingService.delete(id);
  }

  @MessagePattern('billing.markPaid')
  markPaid(@Payload() { id }: { id: string }) {
    return this.billingService.markPaid(id);
  }

  @MessagePattern('billing.remindOverdue')
  remindOverdue() {
    return this.billingService.remindOverdue();
  }

  /*────────────────────────────────────
   * STRIPE CHECKOUT SESSION (Gateway → Billing)
   *────────────────────────────────────*/

  @MessagePattern('billing.pay.createCheckout')
  createCheckout(@Payload() { invoiceId }: { invoiceId: string }) {
    return this.paymentService.createCheckoutSession(invoiceId);
  }

  /*────────────────────────────────────
   * STRIPE WEBHOOK (Gateway → Billing)
   *────────────────────────────────────*/

  @MessagePattern('billing.pay.webhook')
  stripeWebhook(
    @Payload()
    data: {
      signature: string;
      rawBody: Buffer;
    },
  ) {
    return this.paymentService.handleWebhook(data.signature, data.rawBody);
  }
}
