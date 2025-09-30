import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { BillingService } from './service/billing.service';
import { Invoice } from './entities/invoice.entity';
import { BillingController } from './controller/billing.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(),
    TypeOrmModule.forFeature([Invoice]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
