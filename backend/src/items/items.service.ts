import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemCategory, ItemType } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemQueryDto } from './dto/item-query.dto';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  public parseExpiration(expiresIn?: string, expiresAt?: string | Date | null): Date | null {
    if (expiresAt) {
      const parsed = new Date(expiresAt);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    if (!expiresIn) return null;

    const match = expiresIn.trim().match(/^(\d+)\s*([smhdw])$/i);
    if (!match) return null;

    const num = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    const now = new Date();
    switch (unit) {
      case 's':
        now.setSeconds(now.getSeconds() + num);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() + num);
        break;
      case 'h':
        now.setHours(now.getHours() + num);
        break;
      case 'd':
        now.setDate(now.getDate() + num);
        break;
      case 'w':
        now.setDate(now.getDate() + num * 7);
        break;
    }
    return now;
  }

  async create(userId: string, createDto: CreateItemDto): Promise<Item> {
    let itemType = createDto.type;

    // Auto-detect item type if not explicitly provided
    if (!itemType) {
      if (createDto.fileUrl) {
        itemType = ItemType.FILE;
      } else if (
        createDto.content &&
        (createDto.content.startsWith('http://') || createDto.content.startsWith('https://'))
      ) {
        itemType = ItemType.LINK;
      } else {
        itemType = ItemType.NOTE;
      }
    }

    // Auto-assign category if default
    let category = createDto.category || ItemCategory.OTHER;
    if (!createDto.category) {
      if (itemType === ItemType.LINK) category = ItemCategory.LINKS;
      else if (itemType === ItemType.FILE) category = ItemCategory.FILES;
    }

    const computedExpiresAt = this.parseExpiration(
      createDto.expiresIn,
      createDto.expiresAt,
    );

    const item = this.itemRepository.create({
      userId,
      type: itemType,
      title: createDto.title,
      content: createDto.content || null,
      fileUrl: createDto.fileUrl || null,
      fileName: createDto.fileName || null,
      fileSize: createDto.fileSize || null,
      mimeType: createDto.mimeType || null,
      category,
      expiresAt: computedExpiresAt,
    });

    return this.itemRepository.save(item);
  }

  async findAll(userId: string, query: ItemQueryDto): Promise<Item[]> {
    const qb = this.itemRepository.createQueryBuilder('item');
    qb.where('item.userId = :userId', { userId });

    // Filter out expired items
    qb.andWhere('(item.expiresAt IS NULL OR item.expiresAt > :now)', {
      now: new Date(),
    });

    if (query.type) {
      qb.andWhere('item.type = :type', { type: query.type });
    }

    if (query.category) {
      qb.andWhere('item.category = :category', { category: query.category });
    }

    if (query.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(item.title) LIKE :searchPattern OR LOWER(item.content) LIKE :searchPattern OR LOWER(item.fileName) LIKE :searchPattern)',
        { searchPattern },
      );
    }

    qb.orderBy('item.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(userId: string, id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this item');
    }

    if (item.expiresAt && item.expiresAt <= new Date()) {
      await this.itemRepository.remove(item);
      throw new NotFoundException('This item has expired and is no longer available');
    }

    return item;
  }

  async update(userId: string, id: string, updateDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(userId, id);

    if (updateDto.title !== undefined) item.title = updateDto.title;
    if (updateDto.content !== undefined) item.content = updateDto.content;
    if (updateDto.type !== undefined) item.type = updateDto.type;
    if (updateDto.category !== undefined) item.category = updateDto.category;
    if (updateDto.fileUrl !== undefined) item.fileUrl = updateDto.fileUrl;

    if (updateDto.expiresIn !== undefined || updateDto.expiresAt !== undefined) {
      item.expiresAt = this.parseExpiration(updateDto.expiresIn, updateDto.expiresAt);
    }

    return this.itemRepository.save(item);
  }

  async remove(userId: string, id: string): Promise<void> {
    const item = await this.findOne(userId, id);
    await this.itemRepository.remove(item);
  }

  async getDashboardStats(userId: string) {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const qb = this.itemRepository.createQueryBuilder('item');
    qb.where('item.userId = :userId', { userId });
    qb.andWhere('(item.expiresAt IS NULL OR item.expiresAt > :now)', { now });

    const allItems = await qb.getMany();

    const totalItems = allItems.length;
    const notes = allItems.filter((i) => i.type === ItemType.NOTE).length;
    const links = allItems.filter((i) => i.type === ItemType.LINK).length;
    const files = allItems.filter((i) => i.type === ItemType.FILE).length;

    const itemsAddedThisWeek = allItems.filter(
      (i) => new Date(i.createdAt) >= oneWeekAgo,
    ).length;

    const recentItems = allItems.slice(0, 5);

    return {
      totalItems,
      notes,
      links,
      files,
      itemsAddedThisWeek,
      recentItems,
    };
  }

  async cleanupExpiredItems(): Promise<number> {
    const now = new Date();
    const result = await this.itemRepository
      .createQueryBuilder()
      .delete()
      .from(Item)
      .where('expiresAt IS NOT NULL AND expiresAt <= :now', { now })
      .execute();

    const count = result.affected || 0;
    if (count > 0) {
      this.logger.log(`Cleaned up ${count} expired item(s).`);
    }
    return count;
  }
}
