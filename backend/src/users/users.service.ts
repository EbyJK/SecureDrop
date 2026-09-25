import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByTelegramId(telegramUserId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { telegramUserId } });
  }

  async findByLinkToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { telegramLinkToken: token } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setTelegramLinkToken(userId: string, token: string): Promise<void> {
    await this.userRepository.update(userId, { telegramLinkToken: token });
  }

  async linkTelegramUser(userId: string, telegramUserId: string): Promise<User> {
    await this.userRepository.update(userId, {
      telegramUserId,
      telegramLinkToken: null,
    });
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async unlinkTelegramUser(userId: string): Promise<User> {
    await this.userRepository.update(userId, {
      telegramUserId: null,
      telegramLinkToken: null,
    });
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
