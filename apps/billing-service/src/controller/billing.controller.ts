import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { BillingService } from '../service/billing.service';


@ApiTags('billing')
@Controller('billing')
export class BillingController {
constructor(private readonly billingService: BillingService) {}


// HTTP endpoints (visible in Swagger)
@Post()
@ApiOperation({ summary: 'Create invoice (HTTP)' })
create(@Body() dto: CreateInvoiceDto) {
return this.billingService.create(dto);
}


@Get()
@ApiOperation({ summary: 'List invoices (HTTP)' })
findAll() {
return this.billingService.findAll();
}


@Get(':id')
@ApiOperation({ summary: 'Get invoice by id (HTTP)' })
findOne(@Param('id') id: string) {
return this.billingService.findOne(id);
}


// Microservice message patterns - other services can call these
@MessagePattern('billing.createInvoice')
async msCreate(@Payload() dto: CreateInvoiceDto) {
return this.billingService.create(dto);
}


@MessagePattern('billing.listInvoices')
async msList() {
return this.billingService.findAll();
}


@MessagePattern('billing.getInvoice')
async msGet(@Payload() payload: { id: string }) {
return this.billingService.findOne(payload.id);
}


@MessagePattern('billing.markPaid')
async msMarkPaid(@Payload() payload: { id: string }) {
return this.billingService.markPaid(payload.id);
}


@MessagePattern('billing.remindOverdue')
async msRemindOverdue() {
return this.billingService.remindOverdue();
}

@MessagePattern('billing.deleteInvoice')
async msDelete(@Payload() payload: { id: string }) {
  return this.billingService.delete(payload.id);
}
}