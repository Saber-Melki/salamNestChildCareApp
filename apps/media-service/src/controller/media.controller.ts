import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MediaService } from '../service/media.service';
import { AlbumDto } from '../dto/create-album.dto';
import { CreateMediaDto } from '../dto/create-media.dto';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ---------- ALBUMS ----------

  @MessagePattern('create_album')
  createAlbum(@Payload() dto: AlbumDto) {
    if (!dto) throw new Error('Invalid Album data');
    return this.mediaService.createAlbum(dto);
  }

  @MessagePattern('get_albums')
  getAlbums() {
    return this.mediaService.getAlbums();
  }

  @MessagePattern('get_album')
  getAlbum(@Payload() id: string) {
    if (!id) throw new Error('Invalid Album ID');
    return this.mediaService.getAlbum(id);
  }

  @MessagePattern('update_album')
  updateAlbum(
    @Payload()
    payload: { id: string; update: Partial<AlbumDto> },
  ) {
    if (!payload?.id || !payload?.update) {
      throw new Error('Invalid update payload');
    }
    return this.mediaService.updateAlbum(payload.id, payload.update);
  }

  @MessagePattern('delete_album')
  deleteAlbum(@Payload() id: string) {
    if (!id) throw new Error('Invalid Album ID');
    return this.mediaService.deleteAlbum(id);
  }

  // ---------- MEDIA ----------

  /**
   * Payload comes from gateway:
   * {
   *   dtos: CreateMediaDto[];
   *   files: Express.Multer.File[];
   *   baseUrl: string;
   * }
   */
  @MessagePattern('create_media')
  createMedia(
    @Payload()
    payload: {
      dtos: CreateMediaDto[];
      files: Express.Multer.File[];
      baseUrl: string;
    },
  ) {
    if (!payload?.dtos || !payload?.files || !payload.baseUrl) {
      throw new Error('Invalid media payload');
    }

    return this.mediaService.createMedias(
      payload.dtos,
      payload.files,
      payload.baseUrl,
    );
  }

  @MessagePattern('get_media')
  getMedia(@Payload() albumId?: string) {
    // albumId will be '' for "all", or a real id for filtered
    const normalized =
      albumId && albumId.trim().length > 0 ? albumId : undefined;

    return this.mediaService.getMedia(normalized);
  }

  @MessagePattern('get_media_by_id')
  getMediaById(@Payload() id: string) {
    if (!id) throw new Error('Invalid media ID');
    return this.mediaService.getMediaById(id);
  }

  @MessagePattern('delete_media')
  deleteMedia(@Payload() id: string) {
    if (!id) throw new Error('Invalid media ID');
    return this.mediaService.deleteMedia(id);
  }
}
