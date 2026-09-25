import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploadPath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  getPublicUrl(filename: string): string {
    return `/api/files/download/${filename}`;
  }

  fileExists(filename: string): boolean {
    return fs.existsSync(this.getUploadPath(filename));
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = this.getUploadPath(filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
