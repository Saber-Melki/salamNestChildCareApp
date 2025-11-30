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
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AlbumDto } from 'apps/media-service/src/dto/create-album.dto';
import { CreateMediaDto } from 'apps/media-service/src/dto/create-media.dto';
import { UpdateAlbumDto } from 'apps/media-service/src/dto/update-album.dto';

@ApiTags('media')
@Controller('media')
export class MediaGatewayController {
  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
  ) {}

  // ---------- ALBUMS ----------

  @Post('albums')
  @ApiOperation({ summary: 'Create album' })
  createAlbum(@Body() dto: AlbumDto) {
    return this.mediaClient.send('create_album', dto);
  }

  @Get('albums')
  @ApiOperation({ summary: 'List albums' })
  getAlbums() {
    // send an empty object as data (NOT null/undefined)
    return this.mediaClient.send('get_albums', {});
  }

  @Get('albums/:id')
  @ApiOperation({ summary: 'Get album by id' })
  getAlbum(@Param('id') id: string) {
    return this.mediaClient.send('get_album', id);
  }

  @Put('albums/:id')
  @ApiOperation({ summary: 'Update album' })
  @ApiBody({ type: UpdateAlbumDto })
  updateAlbum(
    @Param('id') id: string,
    @Body() update: UpdateAlbumDto,
  ) {
    return this.mediaClient.send('update_album', { id, update });
  }

  @Delete('albums/:id')
  @ApiOperation({ summary: 'Delete album' })
  deleteAlbum(@Param('id') id: string) {
    return this.mediaClient.send('delete_album', id);
  }

  // ---------- MEDIA ----------

  @Post('items')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // folder in API gateway app
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(
              file.originalname,
            )}`,
          );
        },
      }),
    }),
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
        tags: {
          type: 'string',
          description: 'comma separated tags',
          example: 'playtime, outdoor',
        },
      },
      required: ['file', 'albumId'],
    },
  })
  async createMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      albumId: string;
      title?: string;
      description?: string;
      tags?: string; // comma separated
    },
  ) {
    if (!body.albumId) {
      throw new Error('albumId is required. Create an album first.');
    }

    const dto: CreateMediaDto = {
      albumId: body.albumId,
      title: body.title,
      description: body.description,
      tags: body.tags
        ? body.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      sharedWith: [],
    };

    // base URL where this gateway serves /uploads
    const baseUrl = process.env.GATEWAY_BASE_URL || 'http://localhost:8080';

    return this.mediaClient.send('create_media', {
      dtos: [dto],
      files: [file],
      baseUrl,
    });
  }

  @Get('items')
  @ApiOperation({ summary: 'List media items (optionally by album)' })
  getMedia(@Query('albumId') albumId?: string) {
    // ❗ IMPORTANT: NEVER send null/undefined → use empty string if no album
    const payload = albumId ?? '';
    return this.mediaClient.send('get_media', payload);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get media by id' })
  getMediaById(@Param('id') id: string) {
    return this.mediaClient.send('get_media_by_id', id);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete media by id' })
  deleteMedia(@Param('id') id: string) {
    return this.mediaClient.send('delete_media', id);
  }
}
