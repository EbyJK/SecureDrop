import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ItemCategory, ItemType } from '../item.entity';

export class ItemQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ItemType)
  @IsOptional()
  type?: ItemType;

  @IsEnum(ItemCategory)
  @IsOptional()
  category?: ItemCategory;
}
