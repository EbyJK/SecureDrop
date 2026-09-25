import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [UsersModule, ItemsModule, FilesModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
