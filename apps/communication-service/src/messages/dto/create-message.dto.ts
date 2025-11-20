import { IsUUID, IsString, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  threadId: string;

  @IsString()
  @IsIn(['you', 'parent'])
  from: 'you' | 'parent';

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  @IsIn(['text', 'image', 'file', 'audio'])
  type?: 'text' | 'image' | 'file' | 'audio';

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;
}
