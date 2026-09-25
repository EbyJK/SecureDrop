import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ExpiredItemsCronService } from './expired-items-cron.service';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [ScheduleModule.forRoot(), ItemsModule],
  providers: [ExpiredItemsCronService],
})
export class SchedulerModule {}
