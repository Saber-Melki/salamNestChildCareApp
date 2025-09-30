import { Controller, Post, Get, Delete, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateInvoiceDto } from 'apps/billing-service/src/dto/create-invoice.dto';

@Controller('billing')
export class BillingGatewayController {
  constructor(@Inject('BILLING_SERVICE') private readonly billingClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateInvoiceDto) {
    return this.billingClient.send('billing.createInvoice', dto);
  }

  @Get()
  async findAll() {
    return this.billingClient.send('billing.listInvoices', {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.billingClient.send('billing.getInvoice', id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.billingClient.send('billing.deleteInvoice', id);
  }


  @Post(':id/paid')
  async markPaid(@Param('id') id: string) {
    return this.billingClient.send('billing.markPaid', { id });
  }

  @Post('remind/overdue')
  async remindOverdue() {
    return this.billingClient.send('billing.remindOverdue', {});
  }
}
