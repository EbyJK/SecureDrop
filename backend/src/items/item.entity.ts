import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ItemType {
  NOTE = 'NOTE',
  LINK = 'LINK',
  FILE = 'FILE',
}

export enum ItemCategory {
  WORK = 'Work',
  STUDY = 'Study',
  DEVELOPMENT = 'Development',
  PERSONAL = 'Personal',
  LINKS = 'Links',
  FILES = 'Files',
  OTHER = 'Other',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ItemType,
    default: ItemType.NOTE,
  })
  type: ItemType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ type: 'integer', nullable: true })
  fileSize: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({
    type: 'enum',
    enum: ItemCategory,
    default: ItemCategory.OTHER,
  })
  category: ItemCategory;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
