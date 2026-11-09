import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { categorizeMimeType, GB, STORAGE_PLANS } from './src/utils/driveLogic';
import { DriveItem, PlanId, ShareAccess, User } from './src/types/drive';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeExt = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB per file
});

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  items: DriveItem[];
}

// Initial Database Seeding
function initializeDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure admin exists
      const hasAdmin = parsed.users.some(
        (u: User) => u.username.toLowerCase() === 'eyad.eliwa'
      );
      if (!hasAdmin) {
        parsed.users.push({
          id: 'admin_eyad_eliwa',
          username: 'Eyad.Eliwa',
          passwordHash: 'Y@sser3767',
          name: 'Eyad Eliwa (Administrator)',
          role: 'admin',
          planId: 'admin_unlimited',
          storageQuotaBytes: -1,
          createdAt: new Date().toISOString(),
        });
      }
      // Ensure items have shareAccess fields
      parsed.items = parsed.items.map((item: DriveItem) => ({
        ...item,
        shareAccess: item.shareAccess || 'private',
        sharedWithUsernames: item.sharedWithUsernames || [],
        publicShareToken: item.publicShareToken || (item.shareAccess === 'public' ? `share_${item.id}` : undefined),
      }));
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (e) {
      console.error('Error reading DB, re-initializing', e);
    }
  }

  // Seed default admin and sample files for cross-device showcase
  const defaultAdmin: User & { passwordHash: string } = {
    id: 'admin_eyad_eliwa',
    username: 'Eyad.Eliwa',
    passwordHash: 'Y@sser3767',
    name: 'Eyad Eliwa (Administrator)',
    role: 'admin',
    planId: 'admin_unlimited',
    storageQuotaBytes: -1, // Unlimited
    createdAt: new Date().toISOString(),
  };

  const sampleUser: User & { passwordHash: string } = {
    id: 'user_alex',
    username: 'alex.morgan',
    passwordHash: 'Password123!',
    name: 'Alex Morgan',
    role: 'user',
    planId: 'pro',
    storageQuotaBytes: 250 * GB,
    createdAt: new Date().toISOString(),
  };

  // Seed demo files for instant previewing
  const demoItems: DriveItem[] = [
    {
      id: 'folder_projects',
      userId: 'admin_eyad_eliwa',
      ownerName: 'Eyad Eliwa',
      name: 'Project Blueprints',
      isFolder: true,
      parentId: null,
      sizeBytes: 0,
      mimeType: 'folder',
      category: 'other',
      isStarred: true,
      isTrashed: false,
      shareAccess: 'private',
      sharedWithUsernames: [],
      createdAt: '2026-10-15T09:20:00Z',
      updatedAt: '2026-10-15T09:20:00Z',
    },
    {
      id: 'doc_welcome',
      userId: 'admin_eyad_eliwa',
      ownerName: 'Eyad Eliwa',
      name: 'Eyad Drive Welcome Guide.txt',
      isFolder: false,
      parentId: null,
      sizeBytes: 1540,
      mimeType: 'text/plain',
      category: 'document',
      isStarred: true,
      isTrashed: false,
      shareAccess: 'public',
      sharedWithUsernames: [],
      publicShareToken: 'pub_welcome_guide',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
      textContent: `Welcome to Eyad Drive - Secure Cloud Storage & AI Workspace!

KEY HIGHLIGHTS:
• Admin Account: Eyad.Eliwa (Unlimited Storage, Admin Panel)
• Admin Can Grant Any Plan to Any User for 100% Free!
• Secure File Previews & Downloads:
   - Preview spreadsheets, images, videos, audio, documents, and code
   - Safe authenticated and public-link downloads
• Private & Public Sharing:
   - Share files privately with specific users or create public shareable links
• Upload Speed, Percentage & Time Remaining:
   - Real-time progress bar with live percentage and estimated time
• Multi-Device Synchronization:
   - Any file uploaded from this account is instantly available and synchronized on any other device logged in with the same credentials.
• Storage Tiers:
   - Free (15 GB)
   - Pro (250 GB)
   - Ultimate (450 GB)
   - Ultimate Pro (1 TB)
   - Admin Unlimited (Infinite)`,
    },
    {
      id: 'code_sample',
      userId: 'admin_eyad_eliwa',
      ownerName: 'Eyad Eliwa',
      name: 'eyad-drive-config.json',
      isFolder: false,
      parentId: 'folder_projects',
      sizeBytes: 920,
      mimeType: 'application/json',
      category: 'code',
      isStarred: false,
      isTrashed: false,
      shareAccess: 'private',
      sharedWithUsernames: [],
      createdAt: '2026-10-22T14:15:00Z',
      updatedAt: '2026-10-22T14:15:00Z',
      textContent: JSON.stringify(
        {
          system: 'Eyad Drive OS',
          version: '4.0.0',
          admin: 'Eyad.Eliwa',
          adminPrivilege: 'Unlimited Storage & Free Plan Grants',
          sharingModes: ['Private (Invited)', 'Public (Shareable Link)'],
          storageEngine: 'Multi-Device Distributed Sync',
          aiEngine: 'Gemini 3.8 Flash',
          plans: ['Free 15GB', 'Pro 250GB', 'Ultimate 450GB', 'Ultimate Pro 1TB', 'Admin Unlimited'],
          status: 'Operational & Secure',
        },
        null,
        2
      ),
    },
    {
      id: 'sample_budget',
      userId: 'admin_eyad_eliwa',
      ownerName: 'Eyad Eliwa',
      name: 'Q4 Budget & Forecast.csv',
      isFolder: false,
      parentId: null,
      sizeBytes: 2540,
      mimeType: 'text/csv',
      category: 'spreadsheet',
      isStarred: true,
      isTrashed: false,
      shareAccess: 'public',
      sharedWithUsernames: [],
      publicShareToken: 'pub_q4_budget',
      createdAt: '2026-10-28T16:40:00Z',
      updatedAt: '2026-10-28T16:40:00Z',
      textContent: `Department,Q1 Allocation,Q2 Allocation,Q3 Allocation,Q4 Projection,Variance
Cloud Infrastructure,$45000,$48000,$52000,$55000,+6%
AI & Gemini Workspaces,$32000,$35000,$41000,$48000,+17%
Security & Compliance,$20000,$21000,$22000,$24000,+9%
Storage Subsystems,$18000,$19000,$23000,$25000,+8%
Client Applications,$25000,$26000,$28000,$30000,+7%`,
    },
  ];

  const db: DatabaseSchema = {
    users: [defaultAdmin, sampleUser],
    items: demoItems,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  return db;
}

let db = initializeDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Helper to authenticate user from Bearer header or token query parameter
function getAuthUser(req: express.Request): (User & { passwordHash: string }) | null {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === 'string') {
    token = req.query.token.trim();
  }

  if (!token) return null;
  const user = db.users.find((u) => u.id === token || u.username === token);
  return user || null;
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { identifier, username, email, password } = req.body;
  const loginKey = (identifier || email || username || '').toLowerCase().trim();

  if (!loginKey || !password) {
    return res.status(400).json({ error: 'Email or username and password are required' });
  }

  // Find user by username or email
  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === loginKey ||
      (u.email && u.email.toLowerCase() === loginKey)
  );

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email/username or password' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token: user.id,
  });
});

// Dedicated Admin Sign-In: Username and Password only
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Admin username and password are required' });
  }

  const cleanUser = username.trim();
  if (cleanUser.toLowerCase() !== 'eyad.eliwa' || password !== 'Y@sser3767') {
    return res.status(401).json({ error: 'Invalid admin credentials. Access denied.' });
  }

  const admin = db.users.find((u) => u.username.toLowerCase() === 'eyad.eliwa');
  if (!admin) {
    return res.status(500).json({ error: 'Admin account not initialized' });
  }

  const { passwordHash: _, ...safeUser } = admin;
  return res.json({
    user: safeUser,
    token: admin.id,
  });
});

// Sign In with Google
app.post('/api/auth/google', (req, res) => {
  const { email, name, googleId } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = db.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Generate username from email
    const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._]/g, '');
    let uniqueUsername = baseUsername;
    let counter = 1;
    while (db.users.some((u) => u.username.toLowerCase() === uniqueUsername.toLowerCase())) {
      uniqueUsername = `${baseUsername}${counter++}`;
    }

    const freePlan = STORAGE_PLANS[0];
    const newUser: User & { passwordHash: string } = {
      id: `user_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: uniqueUsername,
      email: cleanEmail,
      name: name?.trim() || uniqueUsername,
      role: 'user',
      planId: 'free',
      storageQuotaBytes: freePlan.quotaBytes,
      authProvider: 'google',
      passwordHash: `google_oauth_${googleId || Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase();
    user = newUser;
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token: user.id,
  });
});

// Regular user registration with Email
app.post('/api/auth/register', (req, res) => {
  const { email, username, password, name, planId } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailExists = db.users.some(
    (u) => u.email && u.email.toLowerCase() === cleanEmail
  );

  if (emailExists) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  // Derive or use provided username
  const baseUsername = (username || cleanEmail.split('@')[0]).trim();
  let uniqueUsername = baseUsername;
  let counter = 1;
  while (db.users.some((u) => u.username.toLowerCase() === uniqueUsername.toLowerCase())) {
    uniqueUsername = `${baseUsername}${counter++}`;
  }

  const chosenPlan = STORAGE_PLANS.find((p) => p.id === planId) || STORAGE_PLANS[0];
  const newUser: User & { passwordHash: string } = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: uniqueUsername,
    email: cleanEmail,
    passwordHash: password,
    name: name.trim(),
    role: 'user',
    planId: chosenPlan.id,
    storageQuotaBytes: chosenPlan.quotaBytes,
    authProvider: 'password',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase();

  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({
    user: safeUser,
    token: newUser.id,
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// -------------------------------------------------------------
// Drive Files & Folders Endpoints
// -------------------------------------------------------------

// Get files for current user (including shared & public files)
app.get('/api/files', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Admin querying with all=true
  if (req.query.all === 'true' && user.role === 'admin') {
    return res.json({ items: db.items });
  }

  // Regular user: own files + files shared with user + public files
  const items = db.items.filter((item) => {
    if (item.userId === user.id) return true;
    if (item.shareAccess === 'public') return true;
    if (item.sharedWithUsernames && item.sharedWithUsernames.includes(user.username)) return true;
    return false;
  });

  return res.json({ items });
});

// Upload a file
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const parentId = req.body.parentId === 'root' || !req.body.parentId ? null : req.body.parentId;
  const shareAccess: ShareAccess = req.body.shareAccess === 'public' ? 'public' : 'private';

  // Calculate current storage usage
  const userItems = db.items.filter((i) => i.userId === user.id && !i.isTrashed);
  const currentUsed = userItems.reduce((acc, i) => acc + (i.sizeBytes || 0), 0);

  // Check quota if not unlimited
  if (user.storageQuotaBytes !== -1 && currentUsed + file.size > user.storageQuotaBytes) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(403).json({
      error: `Storage quota exceeded. Your current plan (${user.planId}) is full. Please upgrade to Pro (250GB), Ultimate (450GB), or Ultimate Pro (1TB).`,
    });
  }

  const category = categorizeMimeType(file.mimetype, file.originalname);

  let textContent: string | undefined;
  if (['document', 'code', 'spreadsheet'].includes(category) && file.size < 500000) {
    try {
      textContent = fs.readFileSync(file.path, 'utf-8');
    } catch {
      // ignore
    }
  }

  const itemId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const publicShareToken = `pub_${Math.random().toString(36).substring(2, 12)}`;

  const newItem: DriveItem = {
    id: itemId,
    userId: user.id,
    ownerName: user.name,
    name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
    isFolder: false,
    parentId: parentId,
    sizeBytes: file.size,
    mimeType: file.mimetype || 'application/octet-stream',
    category,
    isStarred: false,
    isTrashed: false,
    shareAccess,
    sharedWithUsernames: [],
    publicShareToken: shareAccess === 'public' ? publicShareToken : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    downloadUrl: `/api/files/download/${file.filename}`,
    previewUrl: `/api/files/preview/${file.filename}`,
    textContent,
  };

  db.items.unshift(newItem);
  saveDatabase();

  return res.status(201).json({ item: newItem });
});

// Create new folder
app.post('/api/files/folder', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { name, parentId } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const newFolder: DriveItem = {
    id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    userId: user.id,
    ownerName: user.name,
    name: name.trim(),
    isFolder: true,
    parentId: parentId === 'root' || !parentId ? null : parentId,
    sizeBytes: 0,
    mimeType: 'folder',
    category: 'other',
    isStarred: false,
    isTrashed: false,
    shareAccess: 'private',
    sharedWithUsernames: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.items.unshift(newFolder);
  saveDatabase();

  return res.status(201).json({ item: newFolder });
});

// Update file sharing (Private vs Public & Shared usernames)
app.patch('/api/files/:id/share', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const item = db.items.find((i) => i.id === req.params.id && (i.userId === user.id || user.role === 'admin'));
  if (!item) {
    return res.status(404).json({ error: 'Item not found or permission denied' });
  }

  const { shareAccess, sharedWithUsernames } = req.body;
  if (shareAccess === 'public' || shareAccess === 'private') {
    item.shareAccess = shareAccess;
    if (shareAccess === 'public' && !item.publicShareToken) {
      item.publicShareToken = `pub_${Math.random().toString(36).substring(2, 12)}`;
    }
  }

  if (Array.isArray(sharedWithUsernames)) {
    item.sharedWithUsernames = sharedWithUsernames.map((u: string) => u.trim()).filter(Boolean);
  }

  item.updatedAt = new Date().toISOString();
  saveDatabase();

  return res.json({ item });
});

// Star toggle
app.patch('/api/files/:id/star', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const item = db.items.find((i) => i.id === req.params.id && (i.userId === user.id || user.role === 'admin'));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  item.isStarred = req.body.isStarred !== undefined ? Boolean(req.body.isStarred) : !item.isStarred;
  item.updatedAt = new Date().toISOString();
  saveDatabase();

  return res.json({ item });
});

// Trash toggle
app.patch('/api/files/:id/trash', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const item = db.items.find((i) => i.id === req.params.id && (i.userId === user.id || user.role === 'admin'));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const isTrashed = req.body.isTrashed !== undefined ? Boolean(req.body.isTrashed) : !item.isTrashed;
  item.isTrashed = isTrashed;
  item.trashedAt = isTrashed ? new Date().toISOString() : null;
  item.updatedAt = new Date().toISOString();
  saveDatabase();

  return res.json({ item });
});

// Delete permanently
app.delete('/api/files/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const index = db.items.findIndex((i) => i.id === req.params.id && (i.userId === user.id || user.role === 'admin'));
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const item = db.items[index];
  if (item.downloadUrl) {
    const filename = path.basename(item.downloadUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error removing file', err);
      }
    }
  }

  db.items.splice(index, 1);
  saveDatabase();

  return res.json({ success: true });
});

// Empty trash
app.post('/api/files/empty-trash', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const toDelete = db.items.filter((i) => i.userId === user.id && i.isTrashed);
  for (const item of toDelete) {
    if (item.downloadUrl) {
      const filename = path.basename(item.downloadUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }
  }

  db.items = db.items.filter((i) => !(i.userId === user.id && i.isTrashed));
  saveDatabase();

  return res.json({ success: true, count: toDelete.length });
});

// Secure Preview Handler
app.get('/api/files/preview/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);

  const item = db.items.find((i) => i.previewUrl?.includes(filename) || i.downloadUrl?.includes(filename));
  if (!item) {
    return res.status(404).send('File not found in Eyad Drive');
  }

  // Security check: If private, require valid session
  if (item.shareAccess === 'private') {
    const user = getAuthUser(req);
    const isAllowed =
      user &&
      (user.id === item.userId ||
        user.role === 'admin' ||
        (item.sharedWithUsernames && item.sharedWithUsernames.includes(user.username)));

    if (!isAllowed) {
      return res.status(403).send('Forbidden: This file is private to its owner.');
    }
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File content not found on server disk');
  }

  res.sendFile(filePath);
});

// Secure Download Handler
app.get('/api/files/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);

  const item = db.items.find((i) => i.downloadUrl?.includes(filename) || i.previewUrl?.includes(filename));
  if (!item) {
    return res.status(404).send('File not found in Eyad Drive');
  }

  // Security check: If private, require authorized session
  if (item.shareAccess === 'private') {
    const user = getAuthUser(req);
    const isAllowed =
      user &&
      (user.id === item.userId ||
        user.role === 'admin' ||
        (item.sharedWithUsernames && item.sharedWithUsernames.includes(user.username)));

    if (!isAllowed) {
      return res.status(403).send('Forbidden: This file is private to its owner.');
    }
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File content not found');
  }

  res.download(filePath, item.name);
});

// Public Share Link Lookup
app.get('/api/share/:token', (req, res) => {
  const token = req.params.token;
  const item = db.items.find((i) => i.publicShareToken === token && i.shareAccess === 'public');
  if (!item) {
    return res.status(404).json({ error: 'Public shared file not found or access revoked' });
  }

  return res.json({ item });
});

// -------------------------------------------------------------
// Storage Plan Upgrade & Management
// -------------------------------------------------------------

app.post('/api/user/plan', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { planId } = req.body;
  const plan = STORAGE_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  user.planId = plan.id;
  user.storageQuotaBytes = plan.quotaBytes;
  saveDatabase();

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser, plan });
});

// -------------------------------------------------------------
// Admin Controls & Free Plan Elevation
// -------------------------------------------------------------

app.get('/api/admin/users', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const usersSummary = db.users.map((u) => {
    const userFiles = db.items.filter((i) => i.userId === u.id);
    const storageUsed = userFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      planId: u.planId,
      storageQuotaBytes: u.storageQuotaBytes,
      storageUsedBytes: storageUsed,
      filesCount: userFiles.length,
      isPlanCompedByAdmin: u.isPlanCompedByAdmin || false,
      createdAt: u.createdAt,
    };
  });

  return res.json({ users: usersSummary, totalFiles: db.items.length });
});

// Admin grants any plan to any user for 100% FREE
app.post('/api/admin/grant-plan', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required (Eyad.Eliwa)' });
  }

  const { targetUserId, planId } = req.body;
  const target = db.users.find((u) => u.id === targetUserId);
  if (!target) {
    return res.status(404).json({ error: 'Target user not found' });
  }

  const plan = STORAGE_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  target.planId = plan.id;
  target.storageQuotaBytes = plan.quotaBytes;
  target.isPlanCompedByAdmin = true; // Mark as granted for free by Eyad.Eliwa
  saveDatabase();

  return res.json({
    success: true,
    message: `Granted ${plan.name} (${plan.displayStorage}) to ${target.name} for 100% FREE!`,
    user: target,
  });
});

// -------------------------------------------------------------
// Gemini AI Support Chat (`/api/ai-chat`)
// -------------------------------------------------------------

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/ai-chat', async (req, res) => {
  const user = getAuthUser(req);
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userItems = user ? db.items.filter((i) => i.userId === user.id) : [];
  const fileSummary = userItems.slice(0, 20).map((f) => ({
    name: f.name,
    category: f.category,
    size: f.sizeBytes,
    isStarred: f.isStarred,
    isFolder: f.isFolder,
    shareAccess: f.shareAccess,
  }));

  const systemInstruction = `You are "Drive Copilot", an intelligent and friendly AI support assistant built directly into "Eyad Drive" (Google Drive styled cloud storage platform).
Your goals:
1. Help users organize, search, preview, and manage their cloud files.
2. Explain sharing options:
   - Private: Only the owner and designated users can view or download.
   - Public: Anyone with the generated link can view and download.
3. Explain storage plans:
   - Free (15 GB)
   - Pro (250 GB, $2.99/mo)
   - Ultimate (450 GB, $6.99/mo)
   - Ultimate Pro (1 TB, $12.99/mo)
   - Admin Unlimited: Infinite storage for admin Eyad.Eliwa. Eyad also has the authority to grant any plan to any user for 100% free!
4. Explain upload progress: Real-time percentage, elapsed time, and time remaining metrics.
5. Explain cross-device sync: Files uploaded from any computer, tablet, or phone immediately sync to Eyad Drive's central server and can be accessed or previewed from any other device logged into the same account.
6. Provide concise, helpful, beautifully formatted markdown answers.

Current user info:
- Name: ${user ? user.name : 'Guest'}
- Username: ${user ? user.username : 'Unknown'}
- Role: ${user ? user.role : 'user'}
- Plan: ${user ? user.planId : 'free'}
- Total Files: ${userItems.length}
- Recent Files Overview: ${JSON.stringify(fileSummary)}
`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...(Array.isArray(history) ? history.slice(-6).map((h: { sender: string; text: string }) => `${h.sender}: ${h.text}`) : []),
          `User: ${message}`,
        ].join('\n\n'),
        config: {
          systemInstruction,
        },
      });

      return res.json({
        reply: response.text || "I'm here to help you manage your files, storage plans, and drive features!",
      });
    }
  } catch (err: unknown) {
    console.error('Gemini API call failed, falling back to smart assistance:', err);
  }

  // Fallback
  const lowerMsg = message.toLowerCase();
  let fallbackReply = `Hello ${user ? user.name : 'there'}! I am your Eyad Drive Copilot. How can I help you today?`;

  if (lowerMsg.includes('share') || lowerMsg.includes('public') || lowerMsg.includes('private')) {
    fallbackReply = `**Sharing in Eyad Drive**:
You can click the **Share** button on any file:
• **Private**: Only you and specifically invited accounts can view/download.
• **Public**: Generates a shareable URL that anyone with the link can view and download.`;
  } else if (lowerMsg.includes('admin') || lowerMsg.includes('free') || lowerMsg.includes('eyad')) {
    fallbackReply = `**Admin Eyad.Eliwa Privileges**:
Administrator **Eyad.Eliwa** enjoys:
1. **Unlimited Storage** (infinite capacity).
2. **Access to Give Any Plan for 100% Free**: Eyad can upgrade any user to Pro (250GB), Ultimate (450GB), Ultimate Pro (1TB), or Unlimited at zero cost from the Admin Tab!`;
  } else if (lowerMsg.includes('plan') || lowerMsg.includes('storage') || lowerMsg.includes('gb') || lowerMsg.includes('tb')) {
    fallbackReply = `**Eyad Drive Storage Plans**:
• **Free**: 15 GB (Complimentary)
• **Pro**: 250 GB ($2.99/mo)
• **Ultimate**: 450 GB ($6.99/mo)
• **Ultimate Pro**: 1 TB ($12.99/mo)
• **Admin Unlimited**: Infinite storage for Eyad.Eliwa (who can also gift any plan for free!).`;
  }

  return res.json({ reply: fallbackReply });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eyad Drive server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
