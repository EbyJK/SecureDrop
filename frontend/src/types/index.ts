export type ItemType = 'NOTE' | 'LINK' | 'FILE';

export type ItemCategory =
  | 'Work'
  | 'Study'
  | 'Development'
  | 'Personal'
  | 'Links'
  | 'Files'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  telegramUserId: string | null;
  telegramLinkToken: string | null;
  createdAt: string;
}

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  category: ItemCategory;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalItems: number;
  notes: number;
  links: number;
  files: number;
  itemsAddedThisWeek: number;
  recentItems: Item[];
}
