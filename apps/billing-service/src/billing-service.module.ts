import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { BillingService } from './service/billing.service';
import { PaymentService } from './service/payment.service';
import { Invoice } from './entities/invoice.entity';
import { BillingController } from './controller/billing.controller';
import { PaymentController } from './controller/payment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' }),
    DatabaseModule.register(),
    TypeOrmModule.forFeature([Invoice]),
  ],
  controllers: [BillingController, PaymentController],
  providers: [BillingService, PaymentService],
})
export class BillingModule {}
