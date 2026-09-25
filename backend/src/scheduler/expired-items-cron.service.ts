import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ItemsService } from '../items/items.service';

@Injectable()
export class ExpiredItemsCronService {
  private readonly logger = new Logger(ExpiredItemsCronService.name);

  constructor(private readonly itemsService: ItemsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredItemsCleanup() {
    try {
      const deletedCount = await this.itemsService.cleanupExpiredItems();
      if (deletedCount > 0) {
        this.logger.log(`Cron Task: Automatically cleaned up ${deletedCount} expired item(s).`);
      }
    } catch (err) {
      this.logger.error('Error executing expired items cleanup cron:', err);
    }
  }
}
