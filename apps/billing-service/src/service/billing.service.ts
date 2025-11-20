// src/app/service/billing.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(@InjectRepository(Invoice) private repo: Repository<Invoice>) {}

  async create(dto: CreateInvoiceDto) {
    const total = dto.items.reduce((s, i) => s + Number(i.amount), 0);
    const inv = this.repo.create({
      family: dto.family,
      amount: total,
      status: 'due',
      dueDate: dto.dueDate,
      items: dto.items,
      notes: dto.notes,
    });

    const saved = await this.repo.save(inv);
    this.logger.log(`Created invoice ${saved.id}`);
    return saved;
  }

  async findAll() {
    // Optionally auto-flag overdue on read
    await this.autoflagOverdue();
    return this.repo.find({ order: { dueDate: 'DESC' } });
  }

  async findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async markPaid(id: string) {
    const inv = await this.findOne(id);
    if (!inv) return null;
    inv.status = 'paid';
    return this.repo.save(inv);
  }

  // Mark invoices with past dueDate as 'overdue' (if still 'due')
  private async autoflagOverdue() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const toOverdue = await this.repo.find({
      where: { status: 'due', dueDate: LessThan(today) },
    });
    if (toOverdue.length) {
      toOverdue.forEach((i) => (i.status = 'overdue'));
      await this.repo.save(toOverdue);
      this.logger.log(`Auto-flagged ${toOverdue.length} invoices as overdue`);
    }
  }

  async remindOverdue() {
    await this.autoflagOverdue();
    const overdue = await this.repo.find({ where: { status: 'overdue' } });
    // stub - integrate email/sms service
    this.logger.log(`Sending reminders for ${overdue.length} overdue invoices`);
    return { reminded: overdue.length };
  }

  async delete(id: string) {
    const inv = await this.findOne(id);
    if (!inv) return null;
    await this.repo.remove(inv);
    this.logger.log(`Deleted invoice ${id}`);
    return { deleted: true };
  }
}
