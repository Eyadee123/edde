export type Role = 'admin' | 'user';

export type PlanId = 'free' | 'pro' | 'ultimate' | 'ultimate_pro' | 'admin_unlimited';

export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'archive'
  | 'code'
  | 'other';

export type ShareAccess = 'private' | 'public';

export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: Role;
  planId: PlanId;
  storageQuotaBytes: number; // -1 for unlimited
  isPlanCompedByAdmin?: boolean; // When granted for free by admin Eyad.Eliwa
  authProvider?: 'password' | 'google';
  createdAt: string;
}

export interface StoragePlan {
  id: PlanId;
  name: string;
  quotaBytes: number;
  displayStorage: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export interface DriveItem {
  id: string;
  userId: string;
  ownerName?: string;
  name: string;
  isFolder: boolean;
  parentId: string | null;
  sizeBytes: number;
  mimeType: string;
  category: FileCategory;
  isStarred: boolean;
  isTrashed: boolean;
  trashedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  previewUrl?: string;
  textContent?: string;
  thumbnailUrl?: string;
  shareAccess: ShareAccess; // 'private' or 'public'
  sharedWithUsernames: string[];
  publicShareToken?: string;
}

export interface StorageSummary {
  usedBytes: number;
  quotaBytes: number; // -1 for unlimited
  formattedUsed: string;
  formattedQuota: string;
  percentageUsed: number;
  isUnlimited: boolean;
  breakdown: Record<FileCategory, number>;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface UploadProgressItem {
  id: string;
  fileName: string;
  sizeBytes: number;
  loadedBytes: number;
  percentage: number;
  speedBytesPerSec: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}
