import { DriveItem, FileCategory, PlanId, StoragePlan, StorageSummary } from '../types/drive';

// Conversion constants
export const KB = 1024;
export const MB = 1024 * KB;
export const GB = 1024 * MB;
export const TB = 1024 * GB;

// Requested storage plans:
// 1. Free gives 15gb
// 2. Pro gives 250gb
// 3. Ultimate gives 450gb
// 4. Ultimate Pro gives 1tb
// Admin has unlimited storage
export const STORAGE_PLANS: StoragePlan[] = [
  {
    id: 'free',
    name: 'Free',
    quotaBytes: 15 * GB,
    displayStorage: '15 GB',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Perfect for essential document storage and basic file sharing.',
    features: [
      '15 GB Secure Cloud Storage',
      'Cross-device sync & preview',
      'Star & organize files',
      'Gemini AI Support Assistant',
      'Standard download speed',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    quotaBytes: 250 * GB,
    displayStorage: '250 GB',
    priceMonthly: 2.99,
    priceYearly: 29.99,
    badge: 'Popular',
    highlight: true,
    description: 'Generous capacity for high-resolution photos, videos, and large archives.',
    features: [
      '250 GB High-Speed Cloud Storage',
      'Real-time cross-device sync & previews',
      'Advanced multi-format previewer',
      'Priority Gemini AI Drive Copilot',
      'Encrypted backup & instant downloads',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    quotaBytes: 450 * GB,
    displayStorage: '450 GB',
    priceMonthly: 6.99,
    priceYearly: 69.99,
    description: 'Designed for professionals and power creators with heavy data demands.',
    features: [
      '450 GB High-Performance Storage',
      'Full media preview suite (4K video, audio)',
      'Unlimited file version history',
      'Dedicated Gemini AI file summarizer',
      '24/7 Priority Support',
    ],
  },
  {
    id: 'ultimate_pro',
    name: 'Ultimate Pro',
    quotaBytes: 1 * TB,
    displayStorage: '1 TB',
    priceMonthly: 12.99,
    priceYearly: 129.99,
    badge: 'Maximum Value',
    description: 'Massive 1 Terabyte tier for teams, media libraries, and complete backups.',
    features: [
      '1 Terabyte (1,000+ GB) Storage',
      'Zero-throttle high-speed transfers',
      'Advanced cross-device sync across all platforms',
      'Comprehensive Admin & sharing controls',
      'Enterprise-grade data encryption',
    ],
  },
  {
    id: 'admin_unlimited',
    name: 'Admin Unlimited',
    quotaBytes: -1, // unlimited
    displayStorage: 'Unlimited',
    priceMonthly: 0,
    priceYearly: 0,
    badge: 'Admin Role',
    description: 'Special administrative tier with infinite storage and global management.',
    features: [
      'Unlimited Cloud Storage (No Quotas)',
      'Full administrative inspection access',
      'Manage all user accounts & plans',
      'System-wide storage metrics',
      'Unrestricted Gemini AI Drive Copilot',
    ],
  },
];

export function getPlanConfig(planId: PlanId): StoragePlan {
  const found = STORAGE_PLANS.find((p) => p.id === planId);
  return (
    found ||
    STORAGE_PLANS[0]
  );
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === -1 || !Number.isFinite(bytes)) return 'Unlimited';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function categorizeMimeType(mimeType: string, filename: string): FileCategory {
  const lowerName = filename.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  if (
    lowerMime.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|heic)$/i.test(lowerName)
  ) {
    return 'image';
  }
  if (
    lowerMime.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv|avi|wmv|flv)$/i.test(lowerName)
  ) {
    return 'video';
  }
  if (
    lowerMime.startsWith('audio/') ||
    /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(lowerName)
  ) {
    return 'audio';
  }
  if (
    lowerMime.includes('pdf') ||
    lowerMime.includes('document') ||
    lowerMime.includes('word') ||
    /\.(pdf|doc|docx|txt|rtf|odt|pages|md)$/i.test(lowerName)
  ) {
    return 'document';
  }
  if (
    lowerMime.includes('sheet') ||
    lowerMime.includes('excel') ||
    lowerMime.includes('csv') ||
    /\.(xls|xlsx|csv|tsv|numbers)$/i.test(lowerName)
  ) {
    return 'spreadsheet';
  }
  if (
    lowerMime.includes('zip') ||
    lowerMime.includes('tar') ||
    lowerMime.includes('compressed') ||
    /\.(zip|tar|gz|rar|7z|bz2)$/i.test(lowerName)
  ) {
    return 'archive';
  }
  if (
    lowerMime.includes('javascript') ||
    lowerMime.includes('typescript') ||
    lowerMime.includes('json') ||
    lowerMime.includes('html') ||
    lowerMime.includes('css') ||
    /\.(js|jsx|ts|tsx|json|html|css|py|java|c|cpp|go|rs|sql|sh|yaml|yml)$/i.test(lowerName)
  ) {
    return 'code';
  }
  return 'other';
}

export function calculateStorageSummary(
  items: DriveItem[],
  quotaBytes: number
): StorageSummary {
  const isUnlimited = quotaBytes === -1;
  const breakdown: Record<FileCategory, number> = {
    image: 0,
    video: 0,
    audio: 0,
    document: 0,
    spreadsheet: 0,
    archive: 0,
    code: 0,
    other: 0,
  };

  let totalUsed = 0;
  for (const item of items) {
    // Trashed items also count towards storage until emptied (like Google Drive)
    if (!item.isFolder) {
      const size = item.sizeBytes || 0;
      totalUsed += size;
      const cat = item.category || 'other';
      breakdown[cat] = (breakdown[cat] || 0) + size;
    }
  }

  let percentage = 0;
  if (!isUnlimited && quotaBytes > 0) {
    percentage = Math.min(100, Math.round((totalUsed / quotaBytes) * 1000) / 10);
  }

  return {
    usedBytes: totalUsed,
    quotaBytes,
    formattedUsed: formatBytes(totalUsed),
    formattedQuota: isUnlimited ? 'Unlimited' : formatBytes(quotaBytes),
    percentageUsed: percentage,
    isUnlimited,
    breakdown,
  };
}

export function canUploadFile(
  currentUsedBytes: number,
  quotaBytes: number,
  incomingBytes: number
): boolean {
  if (quotaBytes === -1) return true; // unlimited
  return currentUsedBytes + incomingBytes <= quotaBytes;
}

export interface FilterOptions {
  tab: 'my-drive' | 'shared' | 'recent' | 'starred' | 'trash' | 'storage' | 'admin';
  parentId?: string | null;
  searchQuery?: string;
  categoryFilter?: string;
  sortBy?: 'name' | 'modified' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export function filterDriveItems(
  items: DriveItem[],
  options: FilterOptions
): DriveItem[] {
  const { tab, parentId, searchQuery, categoryFilter, sortBy = 'name', sortOrder = 'asc' } = options;

  let filtered = [...items];

  // 1. Tab-based isolation
  if (tab === 'trash') {
    filtered = filtered.filter((i) => i.isTrashed);
  } else {
    filtered = filtered.filter((i) => !i.isTrashed);

    if (tab === 'starred') {
      filtered = filtered.filter((i) => i.isStarred);
    } else if (tab === 'recent') {
      // Recent only includes files (not folders), sorted by creation/update date descending
      filtered = filtered.filter((i) => !i.isFolder);
    } else if (tab === 'shared') {
      // Shared tab shows files marked as public or shared with users
      filtered = filtered.filter(
        (i) =>
          i.shareAccess === 'public' ||
          (i.sharedWithUsernames && i.sharedWithUsernames.length > 0) ||
          i.parentId === 'shared' ||
          (i.name && i.name.toLowerCase().includes('shared'))
      );
    } else if (tab === 'my-drive') {
      // If there's an active search query, we search across all folders in My Drive.
      // Otherwise, we strictly filter by current parent folder!
      if (!searchQuery || searchQuery.trim() === '') {
        filtered = filtered.filter((i) => {
          if (!parentId || parentId === 'root') {
            return !i.parentId || i.parentId === 'root';
          }
          return i.parentId === parentId;
        });
      }
    }
  }

  // 2. Search query filter
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((i) => {
      const matchName = i.name.toLowerCase().includes(q);
      const matchCat = i.category.toLowerCase().includes(q);
      const matchText = i.textContent ? i.textContent.toLowerCase().includes(q) : false;
      return matchName || matchCat || matchText;
    });
  }

  // 3. Category filter
  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter((i) => i.category === categoryFilter);
  }

  // 4. Sorting: Folders always on top, then items by requested field
  filtered.sort((a, b) => {
    // Folders come first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortBy === 'size') {
      comparison = (a.sizeBytes || 0) - (b.sizeBytes || 0);
    } else if (sortBy === 'modified') {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      comparison = dateA - dateB;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
}

export function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const remainingSecs = s % 60;
  return `${mins}m ${remainingSecs}s`;
}

export function calculateUploadEstimates(
  loaded: number,
  total: number,
  startTimeMs: number,
  currentTimeMs: number
): {
  percentage: number;
  speedBytesPerSec: number;
  elapsedSeconds: number;
  remainingSeconds: number;
} {
  const percentage = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  const elapsedSeconds = Math.max(0.1, (currentTimeMs - startTimeMs) / 1000);
  const speedBytesPerSec = loaded / elapsedSeconds;
  const remainingBytes = Math.max(0, total - loaded);
  const remainingSeconds = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0;

  return {
    percentage,
    speedBytesPerSec,
    elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
    remainingSeconds,
  };
}

export function canUserAccessFile(
  file: DriveItem,
  user: { id: string; username: string; role: string } | null,
  shareToken?: string
): boolean {
  // 1. If public share access is enabled, access is permitted
  if (file.shareAccess === 'public') return true;

  // 2. If token matches public share token
  if (file.publicShareToken && shareToken && file.publicShareToken === shareToken) return true;

  // 3. If unauthenticated and file is not public, deny
  if (!user) return false;

  // 4. Admin always has full secure access
  if (user.role === 'admin' || user.username.toLowerCase() === 'eyad.eliwa') return true;

  // 5. Owner has access
  if (file.userId === user.id) return true;

  // 6. Explicitly shared users
  if (file.sharedWithUsernames && Array.isArray(file.sharedWithUsernames)) {
    const isShared = file.sharedWithUsernames.some(
      (u) => u.toLowerCase().trim() === user.username.toLowerCase().trim()
    );
    if (isShared) return true;
  }

  return false;
}

