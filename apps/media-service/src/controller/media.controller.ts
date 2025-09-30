import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MediaService } from '../service/media.service';
import { AlbumDto } from '../dto/create-album.dto';
import { CreateMediaDto } from '../dto/create-media.dto';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // --- Albums ---
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
  updateAlbum(@Payload() payload: { id: string; update: Partial<AlbumDto> }) {
    if (!payload?.id || !payload?.update) throw new Error('Invalid update payload');
    return this.mediaService.updateAlbum(payload.id, payload.update);
  }

  @MessagePattern('delete_album')
  deleteAlbum(@Payload() id: string) {
    if (!id) throw new Error('Invalid Album ID');
    return this.mediaService.deleteAlbum(id);
  }

  // --- Media Items ---
  @MessagePattern('create_media')
  createMedia(@Payload() payload: { dto: CreateMediaDto; file: any }) {
    if (!payload?.dto || !payload?.file) throw new Error('Invalid media payload');

    const safeDto = {
      ...payload.dto,
      tags: payload.dto.tags || [],
      sharedWith: payload.dto.sharedWith || [],
      title: payload.dto.title || '',
      description: payload.dto.description || '',
      albumId: payload.dto.albumId || ''
    };

    return this.mediaService.createMedias([safeDto], [payload.file]);
  }

  @MessagePattern('get_media')
  getMedia(@Payload() albumId?: string) {
    return this.mediaService.getMedia(albumId || null);
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
