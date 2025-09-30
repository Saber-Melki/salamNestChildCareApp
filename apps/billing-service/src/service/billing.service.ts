import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';


@Injectable()
export class BillingService {
    
    private readonly logger = new Logger(BillingService.name);
    constructor(@InjectRepository(Invoice) private repo: Repository<Invoice>) { }


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


    async remindOverdue() {
        const overdue = await this.repo.find({ where: { status: 'overdue' } });
        // stub - integrate email/sms service
        this.logger.log(`Found ${overdue.length} overdue invoices`);
        return overdue.length;
    }

    async delete(id: string) {
        const inv = await this.findOne(id);
        if (!inv) return null;
        await this.repo.remove(inv);
        this.logger.log(`Deleted invoice ${id}`);
        return { deleted: true };
    }
}