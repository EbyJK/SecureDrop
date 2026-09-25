import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemQueryDto } from './dto/item-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  async create(@Request() req, @Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(req.user.id, createItemDto);
  }

  @Get()
  async findAll(@Request() req, @Query() query: ItemQueryDto) {
    return this.itemsService.findAll(req.user.id, query);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.itemsService.getDashboardStats(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.itemsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(req.user.id, id, updateItemDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.itemsService.remove(req.user.id, id);
    return { message: 'Item deleted successfully' };
  }
}
