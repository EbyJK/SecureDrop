import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ItemCategory, ItemType } from '../item.entity';

export class CreateItemDto {
  @IsEnum(ItemType)
  @IsOptional()
  type?: ItemType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsEnum(ItemCategory)
  @IsOptional()
  category?: ItemCategory;

  @IsString()
  @IsOptional()
  expiresIn?: string; // e.g. "2h", "1d", "30m", or ISO timestamp string

  @IsOptional()
  expiresAt?: string | Date;
}
