import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  categorizeMimeType,
  calculateStorageSummary,
  canUploadFile,
  filterDriveItems,
  calculateUploadEstimates,
  formatSeconds,
  canUserAccessFile,
  STORAGE_PLANS,
  GB,
  TB,
} from './driveLogic';
import { DriveItem } from '../types/drive';

test('formatBytes handles zero, small bytes, gigabytes, and unlimited', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(15 * GB), '15 GB');
  assert.equal(formatBytes(1 * TB), '1 TB');
  assert.equal(formatBytes(-1), 'Unlimited');
});

test('storage plans meet user requirements: 15gb free, 250gb pro, 450gb ultimate, 1tb ultimate pro, unlimited admin', () => {
  const freePlan = STORAGE_PLANS.find((p) => p.id === 'free');
  assert.ok(freePlan);
  assert.equal(freePlan.quotaBytes, 15 * GB);

  const proPlan = STORAGE_PLANS.find((p) => p.id === 'pro');
  assert.ok(proPlan);
  assert.equal(proPlan.quotaBytes, 250 * GB);

  const ultimatePlan = STORAGE_PLANS.find((p) => p.id === 'ultimate');
  assert.ok(ultimatePlan);
  assert.equal(ultimatePlan.quotaBytes, 450 * GB);

  const ultimateProPlan = STORAGE_PLANS.find((p) => p.id === 'ultimate_pro');
  assert.ok(ultimateProPlan);
  assert.equal(ultimateProPlan.quotaBytes, 1 * TB);

  const adminPlan = STORAGE_PLANS.find((p) => p.id === 'admin_unlimited');
  assert.ok(adminPlan);
  assert.equal(adminPlan.quotaBytes, -1);
});

test('categorizeMimeType correctly detects images, videos, audio, documents, and code', () => {
  assert.equal(categorizeMimeType('image/png', 'photo.png'), 'image');
  assert.equal(categorizeMimeType('video/mp4', 'movie.mp4'), 'video');
  assert.equal(categorizeMimeType('audio/mpeg', 'song.mp3'), 'audio');
  assert.equal(categorizeMimeType('application/pdf', 'contract.pdf'), 'document');
  assert.equal(categorizeMimeType('text/plain', 'notes.txt'), 'document');
  assert.equal(categorizeMimeType('application/vnd.ms-excel', 'data.xlsx'), 'spreadsheet');
  assert.equal(categorizeMimeType('text/javascript', 'app.ts'), 'code');
  assert.equal(categorizeMimeType('application/zip', 'archive.zip'), 'archive');
});

test('calculateStorageSummary sums item sizes and respects unlimited quota', () => {
  const sampleItems: DriveItem[] = [
    {
      id: '1',
      userId: 'u1',
      name: 'photo.jpg',
      isFolder: false,
      parentId: null,
      sizeBytes: 5 * 1024 * 1024, // 5 MB
      mimeType: 'image/jpeg',
      category: 'image',
      isStarred: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareAccess: 'private',
      sharedWithUsernames: [],
    },
    {
      id: '2',
      userId: 'u1',
      name: 'doc.pdf',
      isFolder: false,
      parentId: null,
      sizeBytes: 10 * 1024 * 1024, // 10 MB
      mimeType: 'application/pdf',
      category: 'document',
      isStarred: true,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareAccess: 'private',
      sharedWithUsernames: [],
    },
    {
      id: 'folder1',
      userId: 'u1',
      name: 'Documents',
      isFolder: true,
      parentId: null,
      sizeBytes: 0,
      mimeType: '',
      category: 'other',
      isStarred: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareAccess: 'private',
      sharedWithUsernames: [],
    },
  ];

  // Limited user (15 GB)
  const summaryLimited = calculateStorageSummary(sampleItems, 15 * GB);
  assert.equal(summaryLimited.usedBytes, 15 * 1024 * 1024);
  assert.equal(summaryLimited.breakdown.image, 5 * 1024 * 1024);
  assert.equal(summaryLimited.breakdown.document, 10 * 1024 * 1024);
  assert.equal(summaryLimited.isUnlimited, false);

  // Admin user (Unlimited)
  const summaryAdmin = calculateStorageSummary(sampleItems, -1);
  assert.equal(summaryAdmin.usedBytes, 15 * 1024 * 1024);
  assert.equal(summaryAdmin.isUnlimited, true);
  assert.equal(summaryAdmin.formattedQuota, 'Unlimited');
});

test('canUploadFile checks storage limits unless quota is unlimited', () => {
  // Regular quota: 100MB limit, 90MB used, upload 20MB -> false
  assert.equal(canUploadFile(90 * 1024 * 1024, 100 * 1024 * 1024, 20 * 1024 * 1024), false);
  // Regular quota: 100MB limit, 50MB used, upload 20MB -> true
  assert.equal(canUploadFile(50 * 1024 * 1024, 100 * 1024 * 1024, 20 * 1024 * 1024), true);
  // Admin quota (-1 unlimited): allows arbitrarily large upload
  assert.equal(canUploadFile(100 * TB, -1, 50 * TB), true);
});

test('filterDriveItems accurately filters by tab (starred, trash, my-drive) and search', () => {
  const items: DriveItem[] = [
    {
      id: 'f1',
      userId: 'u1',
      name: 'Resume.pdf',
      isFolder: false,
      parentId: 'root',
      sizeBytes: 1000,
      mimeType: 'application/pdf',
      category: 'document',
      isStarred: true,
      isTrashed: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      shareAccess: 'private',
      sharedWithUsernames: [],
    },
    {
      id: 'f2',
      userId: 'u1',
      name: 'Logo.png',
      isFolder: false,
      parentId: 'root',
      sizeBytes: 2000,
      mimeType: 'image/png',
      category: 'image',
      isStarred: false,
      isTrashed: false,
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      shareAccess: 'private',
      sharedWithUsernames: [],
    },
    {
      id: 'f3',
      userId: 'u1',
      name: 'OldNotes.txt',
      isFolder: false,
      parentId: 'root',
      sizeBytes: 500,
      mimeType: 'text/plain',
      category: 'document',
      isStarred: true,
      isTrashed: true,
      createdAt: '2026-01-03T00:00:00Z',
      updatedAt: '2026-01-03T00:00:00Z',
      shareAccess: 'private',
      sharedWithUsernames: [],
    },
    {
      id: 'f4',
      userId: 'u2',
      name: 'PublicSpecification.pdf',
      isFolder: false,
      parentId: null,
      sizeBytes: 1500,
      mimeType: 'application/pdf',
      category: 'document',
      isStarred: false,
      isTrashed: false,
      createdAt: '2026-01-04T00:00:00Z',
      updatedAt: '2026-01-04T00:00:00Z',
      shareAccess: 'public',
      sharedWithUsernames: [],
    },
  ];

  // Starred tab: only non-trashed starred items
  const starred = filterDriveItems(items, { tab: 'starred' });
  assert.equal(starred.length, 1);
  assert.equal(starred[0].name, 'Resume.pdf');

  // Trash tab: only trashed items
  const trash = filterDriveItems(items, { tab: 'trash' });
  assert.equal(trash.length, 1);
  assert.equal(trash[0].name, 'OldNotes.txt');

  // Search in My Drive
  const searchResult = filterDriveItems(items, { tab: 'my-drive', searchQuery: 'Logo' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].name, 'Logo.png');

  // Shared tab: public files
  const shared = filterDriveItems(items, { tab: 'shared' });
  assert.equal(shared.length, 1);
  assert.equal(shared[0].name, 'PublicSpecification.pdf');
});

test('calculateUploadEstimates and formatSeconds compute percentage and remaining time accurately', () => {
  const estimates = calculateUploadEstimates(
    50 * 1024 * 1024, // 50 MB
    100 * 1024 * 1024, // 100 MB
    1000,
    6000 // 5 seconds elapsed
  );

  assert.equal(estimates.percentage, 50);
  assert.equal(estimates.elapsedSeconds, 5);
  // Speed is 10 MB/sec, so 50 MB remaining takes 5 seconds
  assert.equal(estimates.remainingSeconds, 5);
  assert.equal(formatSeconds(5), '5s');
  assert.equal(formatSeconds(85), '1m 25s');
});

test('canUserAccessFile enforces private vs public sharing and admin oversight securely', () => {
  const privateFile: DriveItem = {
    id: 'f_priv',
    userId: 'user_1',
    name: 'secret.txt',
    isFolder: false,
    parentId: null,
    sizeBytes: 100,
    mimeType: 'text/plain',
    category: 'document',
    isStarred: false,
    isTrashed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareAccess: 'private',
    sharedWithUsernames: ['sarah.dev'],
  };

  const publicFile: DriveItem = {
    ...privateFile,
    id: 'f_pub',
    shareAccess: 'public',
    sharedWithUsernames: [],
  };

  // Public file: anyone can access (even unauthenticated)
  assert.equal(canUserAccessFile(publicFile, null), true);

  // Private file: unauthenticated is denied
  assert.equal(canUserAccessFile(privateFile, null), false);

  // Private file: unrelated user is denied
  assert.equal(canUserAccessFile(privateFile, { id: 'user_2', username: 'bob', role: 'user' }), false);

  // Private file: owner is allowed
  assert.equal(canUserAccessFile(privateFile, { id: 'user_1', username: 'alice', role: 'user' }), true);

  // Private file: explicitly shared username is allowed
  assert.equal(canUserAccessFile(privateFile, { id: 'user_3', username: 'sarah.dev', role: 'user' }), true);

  // Private file: admin Eyad.Eliwa is allowed
  assert.equal(canUserAccessFile(privateFile, { id: 'admin_id', username: 'Eyad.Eliwa', role: 'admin' }), true);
});

