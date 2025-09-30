import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../libs/database/src/database.module';
import { ChildController } from './controller/child.controller';
import { Child } from './entities/child.entity';
import { ChildService } from './service/child.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule.register(), // ton module partagé pour gérer TypeORM
    TypeOrmModule.forFeature([Child]), // dépôt spécifique aux enfants
  ],
  controllers: [ChildController],
  providers: [ChildService],
})
export class ChildServiceModule {} // <-- cohérent avec main.ts
