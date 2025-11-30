import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../entities/album.entity';
import { Media, MediaType } from '../entities/media.entity';
import { AlbumDto } from '../dto/create-album.dto';
import { CreateMediaDto } from '../dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  // ---------- ALBUMS ----------

  async createAlbum(dto: AlbumDto): Promise<Album> {
    if (!dto?.name) throw new BadRequestException('Album name is required');

    const album = this.albumRepo.create({
      name: dto.name,
      description: dto.description ?? '',
      isPublic: dto.isPublic ?? true,
      itemCount: 0,
    });

    return this.albumRepo.save(album);
  }

  async getAlbums(): Promise<Album[]> {
    return this.albumRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getAlbum(id: string): Promise<Album> {
    const album = await this.albumRepo.findOne({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async updateAlbum(id: string, update: Partial<AlbumDto>): Promise<Album> {
  if (!id) {
    throw new BadRequestException('Album ID is required');
  }

  try {
    const result = await this.albumRepo.update(id, {
      ...(update.name !== undefined ? { name: update.name } : {}),
      ...(update.description !== undefined ? { description: update.description } : {}),
      ...(update.isPublic !== undefined ? { isPublic: update.isPublic } : {}),
    });

    if (result.affected === 0) {
      throw new NotFoundException('Album not found');
    }

    return this.getAlbum(id);
  } catch (error) {
    console.error('[MediaService] Error updating album', { id, update, error });
    throw error;
  }
}


  async deleteAlbum(id: string): Promise<{ success: boolean }> {
    const album = await this.getAlbum(id);

    const mediaCount = await this.mediaRepo.count({ where: { albumId: id } });
    if (mediaCount > 0) {
      throw new BadRequestException('Cannot delete album with media items');
    }

    await this.albumRepo.remove(album);
    return { success: true };
  }

  // ---------- MEDIA ----------

  /**
   * Create media items inside an album.
   * We expect:
   * - albumId in dto
   * - file(s) already saved by the API gateway (Multer)
   * - we only receive filename + mimetype etc. here
   */
  async createMedias(
    dtos: CreateMediaDto[],
    files: Express.Multer.File[],
    baseUrl: string, // e.g. http://localhost:8080
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results: Media[] = [];

    for (let i = 0; i < files.length; i++) {
      const dto = dtos[i];
      const file = files[i];

      if (!dto?.albumId) {
        throw new BadRequestException('albumId is required');
      }

      const album = await this.getAlbum(dto.albumId);
      if (!album) throw new NotFoundException('Album not found');

      // infer type from mimetype
      const type = file.mimetype.startsWith('video/')
        ? MediaType.VIDEO
        : MediaType.IMAGE;

      // Where the gateway serves static files. We store a full URL or relative path.
      const url = `${baseUrl}/uploads/${file.filename}`;

      const media = this.mediaRepo.create({
        albumId: dto.albumId,
        url,
        type,
        title: dto.title ?? file.originalname,
        description: dto.description ?? '',
        tags: dto.tags ?? [],
        sharedWith: dto.sharedWith ?? [],
      });

      const saved = await this.mediaRepo.save(media);

      // increment album counter
      album.itemCount = (album.itemCount ?? 0) + 1;
      await this.albumRepo.save(album);

      results.push(saved);
    }

    return results;
  }

  async getMedia(albumId?: string): Promise<Media[]> {
    if (albumId) {
      return this.mediaRepo.find({
        where: { albumId },
        order: { uploadDate: 'DESC' },
      });
    }
    return this.mediaRepo.find({ order: { uploadDate: 'DESC' } });
  }

  async getMediaById(id: string): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async deleteMedia(id: string): Promise<{ success: boolean }> {
    const media = await this.getMediaById(id);

    const album = await this.getAlbum(media.albumId);
    if (album && (album.itemCount ?? 0) > 0) {
      album.itemCount = album.itemCount - 1;
      await this.albumRepo.save(album);
    }

    await this.mediaRepo.remove(media);
    return { success: true };
  }
}
