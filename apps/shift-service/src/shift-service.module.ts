import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { Shift } from './entities/shift.entity';
import { ShiftController } from './controller/shift.controller';
import { ShiftService } from './service/shift.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(), // module partagé pour TypeORM
    TypeOrmModule.forFeature([Shift]), // dépôt spécifique pour Shift
  ],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftServiceModule {}
