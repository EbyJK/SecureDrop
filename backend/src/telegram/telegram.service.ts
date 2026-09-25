import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { FilesService } from '../files/files.service';
import { ItemType, ItemCategory } from '../items/item.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly filesService: FilesService,
  ) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token || token === 'your_telegram_bot_token_here') {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN is not configured in .env. Telegram Bot listener will remain disabled until token is set.',
      );
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.registerHandlers();
      this.logger.log('Telegram Bot successfully initialized and polling for updates!');
    } catch (err) {
      this.logger.error('Failed to initialize Telegram Bot:', err);
    }
  }

  private registerHandlers() {
    if (!this.bot) return;

    // Handle /start command
    this.bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      const token = match?.[1]?.trim();

      if (!telegramUserId) return;

      if (token) {
        // Pairing token provided
        const user = await this.usersService.findByLinkToken(token);
        if (user) {
          await this.usersService.linkTelegramUser(user.id, telegramUserId);
          return this.bot?.sendMessage(
            chatId,
            `✅ *Account Linked Successfully!*\n\nHello *${user.name}*, your Telegram account is now connected to *SecureDrop*.\n\nYou can send me any text, links, or documents to save them to your dashboard immediately!\n\nType /help to view commands.`,
            { parse_mode: 'Markdown' },
          );
        } else {
          return this.bot?.sendMessage(
            chatId,
            '❌ *Invalid or Expired Link Token.*\nPlease generate a new link token from your SecureDrop Web Dashboard Settings.',
            { parse_mode: 'Markdown' },
          );
        }
      }

      // Check if already linked
      const user = await this.usersService.findByTelegramId(telegramUserId);
      if (user) {
        return this.bot?.sendMessage(
          chatId,
          `👋 Welcome back to *SecureDrop*, *${user.name}*!\n\nSend me any text, link, or document, and I'll save it for you.\nType /help for command list.`,
          { parse_mode: 'Markdown' },
        );
      } else {
        return this.bot?.sendMessage(
          chatId,
          `🔒 *Welcome to SecureDrop!*\n\nYour Telegram account is not linked yet.\n\n*How to link your account:*\n1. Log into your SecureDrop Web Dashboard\n2. Go to *Settings* -> *Link Telegram*\n3. Click the generated Telegram link or send \`/start <token>\` here.`,
          { parse_mode: 'Markdown' },
        );
      }
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpText = `🛠 *SecureDrop Bot Commands*

• \`/save <text|url> [--expires 2h|1d]\` — Save a note or link
• \`/list\` — List your recent saved items
• \`/search <keyword>\` — Search saved content
• \`/delete <item_id>\` — Delete a saved item
• \`/help\` — Show this help message

💡 *Pro-tip:* You can also send or forward text, links, photos, and files directly to this chat without typing commands!`;
      this.bot?.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });

    // Handle /save command
    this.bot.onText(/\/save(?:\s+([\s\S]+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      const textInput = match?.[1]?.trim();

      if (!telegramUserId) return;
      const user = await this.usersService.findByTelegramId(telegramUserId);
      if (!user) {
        return this.sendNotLinkedMessage(chatId);
      }

      if (!textInput) {
        return this.bot?.sendMessage(
          chatId,
          '⚠️ Please provide content to save. Example: `/save Buy groceries tomorrow --expires 2h`',
          { parse_mode: 'Markdown' },
        );
      }

      await this.processAndSaveText(user.id, chatId, textInput);
    });

    // Handle /list command
    this.bot.onText(/\/list/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      if (!telegramUserId) return;

      const user = await this.usersService.findByTelegramId(telegramUserId);
      if (!user) return this.sendNotLinkedMessage(chatId);

      const items = await this.itemsService.findAll(user.id, {});
      if (items.length === 0) {
        return this.bot?.sendMessage(chatId, '📭 You have no saved items yet.');
      }

      let message = `📋 *Your Saved Items (${items.length}):*\n\n`;
      items.slice(0, 10).forEach((item, idx) => {
        const typeEmoji =
          item.type === ItemType.LINK ? '🔗' : item.type === ItemType.FILE ? '📁' : '📝';
        message += `${idx + 1}. ${typeEmoji} *${item.title}*\n   ID: \`${item.id}\` | Category: \`${item.category}\`\n\n`;
      });

      if (items.length > 10) {
        message += `_...and ${items.length - 10} more in your Web Dashboard._`;
      }

      this.bot?.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });

    // Handle /search command
    this.bot.onText(/\/search(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      const query = match?.[1]?.trim();

      if (!telegramUserId) return;
      const user = await this.usersService.findByTelegramId(telegramUserId);
      if (!user) return this.sendNotLinkedMessage(chatId);

      if (!query) {
        return this.bot?.sendMessage(chatId, '⚠️ Usage: `/search <query>`', {
          parse_mode: 'Markdown',
        });
      }

      const items = await this.itemsService.findAll(user.id, { search: query });
      if (items.length === 0) {
        return this.bot?.sendMessage(
          chatId,
          `🔍 No items found matching "*${query}*"`,
          { parse_mode: 'Markdown' },
        );
      }

      let message = `🔍 *Search Results for "${query}" (${items.length}):*\n\n`;
      items.slice(0, 8).forEach((item, idx) => {
        const typeEmoji =
          item.type === ItemType.LINK ? '🔗' : item.type === ItemType.FILE ? '📁' : '📝';
        message += `${idx + 1}. ${typeEmoji} *${item.title}*\n   ID: \`${item.id}\`\n`;
      });

      this.bot?.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });

    // Handle /delete command
    this.bot.onText(/\/delete(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      const itemId = match?.[1]?.trim();

      if (!telegramUserId) return;
      const user = await this.usersService.findByTelegramId(telegramUserId);
      if (!user) return this.sendNotLinkedMessage(chatId);

      if (!itemId) {
        return this.bot?.sendMessage(chatId, '⚠️ Usage: `/delete <item_id>`', {
          parse_mode: 'Markdown',
        });
      }

      try {
        await this.itemsService.remove(user.id, itemId);
        return this.bot?.sendMessage(chatId, `🗑️ Item \`${itemId}\` deleted successfully.`, {
          parse_mode: 'Markdown',
        });
      } catch (err) {
        return this.bot?.sendMessage(
          chatId,
          '❌ Could not delete item. Please verify the Item ID.',
        );
      }
    });

    // Handle incoming non-command messages & files
    this.bot.on('message', async (msg) => {
      if (msg.text && msg.text.startsWith('/')) return; // Ignore slash commands

      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      if (!telegramUserId) return;

      const user = await this.usersService.findByTelegramId(telegramUserId);
      if (!user) {
        return this.sendNotLinkedMessage(chatId);
      }

      // 1. Text message
      if (msg.text) {
        await this.processAndSaveText(user.id, chatId, msg.text);
      }
      // 2. Document file
      else if (msg.document) {
        await this.handleDocumentUpload(user.id, chatId, msg.document, msg.caption);
      }
      // 3. Photo message
      else if (msg.photo && msg.photo.length > 0) {
        const highestResPhoto = msg.photo[msg.photo.length - 1];
        await this.handlePhotoUpload(user.id, chatId, highestResPhoto, msg.caption);
      }
    });
  }

  private async sendNotLinkedMessage(chatId: number) {
    return this.bot?.sendMessage(
      chatId,
      '🔒 *Telegram Account Not Linked.*\nPlease link your Telegram account in SecureDrop Web Dashboard Settings first!',
      { parse_mode: 'Markdown' },
    );
  }

  private async processAndSaveText(userId: string, chatId: number, text: string) {
    let expiresIn: string | undefined = undefined;
    let cleanText = text;

    const expiresMatch = text.match(/--expires\s+(\d+[smhdw])/i);
    if (expiresMatch) {
      expiresIn = expiresMatch[1];
      cleanText = text.replace(/--expires\s+\d+[smhdw]/gi, '').trim();
    }

    const isUrl = /^https?:\/\/[^\s]+$/i.test(cleanText);
    const itemType = isUrl ? ItemType.LINK : ItemType.NOTE;
    const title = isUrl
      ? cleanText.length > 60
        ? cleanText.substring(0, 57) + '...'
        : cleanText
      : cleanText.split('\n')[0].substring(0, 60);

    const created = await this.itemsService.create(userId, {
      type: itemType,
      title,
      content: cleanText,
      category: isUrl ? ItemCategory.LINKS : ItemCategory.PERSONAL,
      expiresIn,
    });

    const expText = created.expiresAt
      ? ` (Expires: ${new Date(created.expiresAt).toLocaleString()})`
      : '';

    this.bot?.sendMessage(
      chatId,
      `✅ Saved as *${itemType}* in SecureDrop!${expText}\nTitle: *${title}*`,
      { parse_mode: 'Markdown' },
    );
  }

  private async handleDocumentUpload(
    userId: string,
    chatId: number,
    doc: TelegramBot.Document,
    caption?: string,
  ) {
    if (!this.bot) return;

    try {
      this.bot.sendMessage(chatId, '📥 Downloading file from Telegram...');

      const fileInfo = await this.bot.getFile(doc.file_id);
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      const downloadUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;

      const ext = path.extname(doc.file_name || 'file.bin');
      const randomFilename = `${Date.now()}_${Math.round(Math.random() * 10000)}${ext}`;
      const localPath = this.filesService.getUploadPath(randomFilename);

      const response = await fetch(downloadUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(localPath, Buffer.from(buffer));

      const fileUrl = this.filesService.getPublicUrl(randomFilename);
      const title = caption || doc.file_name || 'Telegram Document';

      await this.itemsService.create(userId, {
        type: ItemType.FILE,
        title,
        content: caption || `File: ${doc.file_name}`,
        fileUrl,
        fileName: doc.file_name || randomFilename,
        fileSize: doc.file_size || buffer.byteLength,
        mimeType: doc.mime_type || 'application/octet-stream',
        category: ItemCategory.FILES,
      });

      this.bot.sendMessage(
        chatId,
        `✅ File *${doc.file_name || 'Document'}* saved successfully to SecureDrop!`,
        { parse_mode: 'Markdown' },
      );
    } catch (err) {
      this.logger.error('Failed to download document from Telegram:', err);
      this.bot.sendMessage(chatId, '❌ Failed to process document file.');
    }
  }

  private async handlePhotoUpload(
    userId: string,
    chatId: number,
    photo: TelegramBot.PhotoSize,
    caption?: string,
  ) {
    if (!this.bot) return;

    try {
      const fileInfo = await this.bot.getFile(photo.file_id);
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      const downloadUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;

      const randomFilename = `photo_${Date.now()}_${Math.round(Math.random() * 1000)}.jpg`;
      const localPath = this.filesService.getUploadPath(randomFilename);

      const response = await fetch(downloadUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(localPath, Buffer.from(buffer));

      const fileUrl = this.filesService.getPublicUrl(randomFilename);
      const title = caption || `Photo ${new Date().toLocaleDateString()}`;

      await this.itemsService.create(userId, {
        type: ItemType.FILE,
        title,
        content: caption || 'Telegram Photo Upload',
        fileUrl,
        fileName: randomFilename,
        fileSize: photo.file_size || buffer.byteLength,
        mimeType: 'image/jpeg',
        category: ItemCategory.FILES,
      });

      this.bot.sendMessage(chatId, `✅ Photo saved successfully to SecureDrop!`, {
        parse_mode: 'Markdown',
      });
    } catch (err) {
      this.logger.error('Failed to download photo from Telegram:', err);
      this.bot.sendMessage(chatId, '❌ Failed to process photo upload.');
    }
  }
}
