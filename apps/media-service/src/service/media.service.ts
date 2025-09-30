import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // -------------------- Albums --------------------
  async createAlbum(dto: AlbumDto): Promise<Album> {
    if (!dto?.name) throw new BadRequestException('Album name is required');

    const album = this.albumRepo.create({
      ...dto,
      // itemCount: 0,
      // createdDate: new Date().toISOString(),
    });

    return await this.albumRepo.save(album);
  }

  async getAlbums(): Promise<Album[]> {
    return this.albumRepo.find();
  }

  async getAlbum(id: string): Promise<Album> {
    const album = await this.albumRepo.findOne({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async updateAlbum(id: string, update: Partial<AlbumDto>): Promise<Album> {
    const album = await this.getAlbum(id);
    Object.assign(album, update);
    return this.albumRepo.save(album);
  }

  async deleteAlbum(id: string): Promise<{ success: boolean }> {
    const album = await this.getAlbum(id);

    const mediaCount = await this.mediaRepo.count({ where: { albumId: id } });
    if (mediaCount > 0) throw new BadRequestException('Cannot delete album with media items');

    await this.albumRepo.remove(album);
    return { success: true };
  }

  // -------------------- Media --------------------
  async createMedias(
    dtos: CreateMediaDto[],
    files?: Express.Multer.File[],
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const savedMedias: Media[] = [];

    for (let i = 0; i < files.length; i++) {
      const dto = dtos[i];
      const file = files[i];

      if (!dto.albumId) {
        throw new BadRequestException('albumId is required');
      }
      const album = await this.getAlbum(dto.albumId);
      if (!album) throw new NotFoundException('Album not found');

      const fileUrl = `http://localhost:8080/uploads/${file.filename}`;

      const media = this.mediaRepo.create({
        ...dto,
        url: fileUrl,
        type: file.mimetype.startsWith('video/')
          ? MediaType.Video
          : MediaType.Image,
        uploadDate: new Date().toISOString(),
      });

      const saved = await this.mediaRepo.save(media);

      album.itemCount++;
      await this.albumRepo.save(album);

      savedMedias.push(saved);
    }

    return savedMedias;
  }

  async getMedia(albumId?: string): Promise<Media[]> {
    if (albumId) {
      return this.mediaRepo.find({ where: { albumId } });
    }
    return this.mediaRepo.find();
  }

  async getMediaById(id: string): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async deleteMedia(id: string): Promise<{ success: boolean }> {
    const media = await this.getMediaById(id);

    const album = await this.getAlbum(media.albumId);
    if (album && album.itemCount > 0) {
      album.itemCount--;
      await this.albumRepo.save(album);
    }

    await this.mediaRepo.remove(media);
    return { success: true };
  }
}