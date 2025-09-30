import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from '../../libs/database/src/database.module';
import { MediaController } from './controller/media.controller';
import { MediaService } from './service/media.service';
import { Media } from './entities/media.entity';
import { Album } from './entities/album.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),

    DatabaseModule.register(), // module partagé pour gérer TypeORM
    TypeOrmModule.forFeature([Media, Album]),

    // Serve uploaded files statically
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // chemin absolu vers uploads
      serveRoot: '/uploads',                             // route accessible via HTTP
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaServiceModule {}
