import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { StaffService } from './service/staff.service';
import { StaffController } from './contoller/staff.controller';
import { Staff } from './entities/staff.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(), // module partagé qui configure TypeORM
    TypeOrmModule.forFeature([Staff]), // dépôt spécifique à staff
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffServiceModule {}
