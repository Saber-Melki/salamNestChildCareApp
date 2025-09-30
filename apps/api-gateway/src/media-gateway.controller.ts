import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AlbumDto } from 'apps/media-service/src/dto/create-album.dto';
import { CreateMediaDto } from 'apps/media-service/src/dto/create-media.dto';


@ApiTags('media')
@Controller('media')
export class MediaGatewayController {
  constructor(@Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy) {}

  // --- Albums ---
  @Post('albums')
  createAlbum(@Body() dto: AlbumDto) {
    return this.mediaClient.send('create_album', dto);
  }

  @Get('albums')
  getAlbums() {
    return this.mediaClient.send('get_albums', {});
  }

  @Get('albums/:id')
  getAlbum(@Param('id') id: string) {
    return this.mediaClient.send('get_album', id);
  }

  @Put('albums/:id')
  updateAlbum(@Param('id') id: string, @Body() update: Partial<AlbumDto>) {
    return this.mediaClient.send('update_album', { id, update });
  }

  @Delete('albums/:id')
  deleteAlbum(@Param('id') id: string) {
    return this.mediaClient.send('delete_album', id);
  }

  // --- Media Items ---
  @Post('items')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    })
  )
  @ApiOperation({ summary: 'Upload media item to an album' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        albumId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        sharedWith: { type: 'array', items: { type: 'string' } }
      },
      required: ['file', 'albumId'],
    },
  })
  createMedia(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateMediaDto & { albumId: string }) {
    const safeDto = {
      ...dto,
      tags: dto.tags || [],
      sharedWith: dto.sharedWith || [],
      title: dto.title || '',
      description: dto.description || '',
      albumId: dto.albumId
    };
    return this.mediaClient.send('create_media', { dto: safeDto, file });
  }

  @Get('items')
  getMedia(@Query('albumId') albumId?: string) {
    return this.mediaClient.send('get_media', albumId || null);
  }

  @Get('items/:id')
  getMediaById(@Param('id') id: string) {
    return this.mediaClient.send('get_media_by_id', id);
  }

  @Delete('items/:id')
  deleteMedia(@Param('id') id: string) {
    return this.mediaClient.send('delete_media', id);
  }
}
