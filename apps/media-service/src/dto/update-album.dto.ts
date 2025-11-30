import { PartialType } from '@nestjs/mapped-types';
import { AlbumDto } from './create-album.dto';

export class UpdateAlbumDto extends PartialType(AlbumDto) {}
