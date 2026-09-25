import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ItemCategory, ItemType } from '../item.entity';

export class UpdateItemDto {
  @IsEnum(ItemType)
  @IsOptional()
  type?: ItemType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsEnum(ItemCategory)
  @IsOptional()
  category?: ItemCategory;

  @IsString()
  @IsOptional()
  expiresIn?: string;

  @IsOptional()
  expiresAt?: string | Date | null;
}
