import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { DriveContent } from './components/DriveContent';
import { FilePreviewModal } from './components/FilePreviewModal';
import { StoragePlansModal } from './components/StoragePlansModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { AuthModal } from './components/AuthModal';
import { NewFolderModal } from './components/NewFolderModal';
import { ShareModal } from './components/ShareModal';
import { UploadProgressWidget } from './components/UploadProgressWidget';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { DriveItem, PlanId, ShareAccess, StorageSummary, UploadProgressItem, User } from './types/drive';
import { calculateStorageSummary, filterDriveItems } from './utils/driveLogic';
import { getThemeConfig } from './types/theme';
import { CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function App() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Active theme configuration (Admin & Ultimate Pro 1TB unlocked)
  const [currentThemeId, setCurrentThemeId] = useState<string>(
    () => localStorage.getItem('eyad_drive_theme') || 'default_light'
  );
  const [showThemesModal, setShowThemesModal] = useState(false);

  // Drive items & navigation
  const [items, setItems] = useState<DriveItem[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTab>('my-drive');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'My Drive' },
  ]);

  // Search, filter, view, sort
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals, Drawers & Widgets
  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);
  const [sharingItem, setSharingItem] = useState<DriveItem | null>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'admin' | 'signup'>('signin');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Upload Progress Tracking
  const [uploadProgressItems, setUploadProgressItems] = useState<UploadProgressItem[]>([]);

  // Toast / Status banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize session: restore or auto login as Eyad.Eliwa
  useEffect(() => {
    const savedToken = localStorage.getItem('eyaddrive_token') || localStorage.getItem('clouddrive_token');
    if (savedToken) {
      setAuthToken(savedToken);
      fetchUser(savedToken);
    } else {
      loginWithCredentials('Eyad.Eliwa', 'Y@sser3767');
    }
  }, []);

  // Check for public share link in URL hash: #shared=token
  useEffect(() => {
    const checkHashShare = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#shared=')) {
        const token = hash.replace('#shared=', '').trim();
        fetchSharedFile(token);
      }
    };
    checkHashShare();
    window.addEventListener('hashchange', checkHashShare);
    return () => window.removeEventListener('hashchange', checkHashShare);
  }, []);

  const fetchSharedFile = async (token: string) => {
    try {
      const res = await fetch(`/api/share/${token}`);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setPreviewItem(data.item);
          showToast(`Opened shared file: ${data.item.name}`, 'info');
        }
      }
    } catch {
      // ignore
    }
  };

  const loginWithCredentials = async (username: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('eyaddrive_token', data.token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('eyaddrive_token');
        localStorage.removeItem('clouddrive_token');
        setAuthToken(null);
        setCurrentUser(null);
      }
    } catch {
      // ignore
    }
  };

  // Fetch files whenever authToken or active user changes
  const fetchFiles = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/files', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchFiles();
    }
  }, [authToken]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('eyaddrive_token', token);
    showToast(
      `Signed in as ${user.name} (${user.role === 'admin' ? 'Unlimited Admin' : user.planId.toUpperCase()})`,
      'success'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('eyaddrive_token');
    localStorage.removeItem('clouddrive_token');
    setItems([]);
    showToast('Signed out of Eyad Drive', 'info');
  };

  const handleOpenAuth = (tab: 'signin' | 'admin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  // Tab navigation
  const handleTabChange = (tab: SidebarTab) => {
    if (tab === 'storage') {
      setShowStorageModal(true);
      return;
    }
    if (tab === 'admin') {
      if (currentUser?.role === 'admin') {
        setShowAdminModal(true);
      } else {
        handleOpenAuth('admin');
      }
      return;
    }
    setActiveTab(tab);
    if (tab !== 'my-drive') {
      setCurrentFolderId(null);
    }
  };

  const handleNavigateFolder = (folderId: string | null, name: string) => {
    setActiveTab('my-drive');
    setCurrentFolderId(folderId);

    if (folderId === null) {
      setFolderPath([{ id: null, name: 'My Drive' }]);
    } else {
      const existingIdx = folderPath.findIndex((f) => f.id === folderId);
      if (existingIdx !== -1) {
        setFolderPath(folderPath.slice(0, existingIdx + 1));
      } else {
        setFolderPath((prev) => [...prev, { id: folderId, name }]);
      }
    }
  };

  // Real-time Upload with Progress Percentage and Time Tracking
  const uploadSingleFileWithProgress = (file: File): Promise<DriveItem> => {
    return new Promise((resolve, reject) => {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const startTime = Date.now();

      // Initialize progress item
      const initialItem: UploadProgressItem = {
        id: uploadId,
        fileName: file.name,
        sizeBytes: file.size,
        loadedBytes: 0,
        percentage: 0,
        speedBytesPerSec: 0,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        status: 'uploading',
      };

      setUploadProgressItems((prev) => [initialItem, ...prev]);

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      if (currentFolderId) {
        formData.append('parentId', currentFolderId);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const loaded = e.loaded;
          const total = e.total;
          const pct = Math.min(99, Math.round((loaded / total) * 100));
          const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
          const speed = loaded / elapsedSec;
          const remainingBytes = total - loaded;
          const remainingSec = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;

          setUploadProgressItems((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? {
                    ...item,
                    loadedBytes: loaded,
                    percentage: pct,
                    speedBytesPerSec: speed,
                    elapsedSeconds: Math.round(elapsedSec),
                    remainingSeconds: remainingSec,
                  }
                : item
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const totalElapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
            setUploadProgressItems((prev) =>
              prev.map((item) =>
                item.id === uploadId
                  ? {
                      ...item,
                      loadedBytes: file.size,
                      percentage: 100,
                      status: 'completed',
                      elapsedSeconds: totalElapsed,
                      remainingSeconds: 0,
                    }
                  : item
              )
            );
            resolve(data.item);
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          let errorMsg = 'Upload failed';
          try {
            const data = JSON.parse(xhr.responseText);
            errorMsg = data.error || errorMsg;
          } catch {
            // ignore
          }
          setUploadProgressItems((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? { ...item, status: 'error', errorMessage: errorMsg }
                : item
            )
          );
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        const errorMsg = 'Network error during upload';
        setUploadProgressItems((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, status: 'error', errorMessage: errorMsg }
              : item
          )
        );
        reject(new Error(errorMsg));
      };

      xhr.open('POST', '/api/files/upload', true);
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }
      xhr.send(formData);
    });
  };

  const handleUploadFiles = async (fileList: FileList) => {
    if (!authToken || !currentUser) {
      handleOpenAuth('signin');
      return;
    }

    let successCount = 0;
    let lastError: string | null = null;

    for (let i = 0; i < fileList.length; i++) {
      try {
        const newItem = await uploadSingleFileWithProgress(fileList[i]);
        setItems((prev) => [newItem, ...prev]);
        successCount++;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : 'Upload failed';
      }
    }

    if (successCount > 0) {
      showToast(
        `Uploaded ${successCount} file${successCount > 1 ? 's' : ''} to Eyad Drive! Synced across devices.`,
        'success'
      );
    }
    if (lastError) {
      showToast(lastError, 'error');
    }
  };

  // Folder creation
  const handleCreateFolder = async (name: string) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/files/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, parentId: currentFolderId }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [data.item, ...prev]);
        showToast(`Created folder "${name}"`, 'success');
      }
    } catch {
      showToast('Failed to create folder', 'error');
    }
  };

  // Update sharing permissions (Private vs Public)
  const handleUpdateShare = async (
    itemId: string,
    shareAccess: ShareAccess,
    sharedWithUsernames: string[]
  ) => {
    if (!authToken) return;
    const res = await fetch(`/api/files/${itemId}/share`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ shareAccess, sharedWithUsernames }),
    });

    if (res.ok) {
      const data = await res.json();
      setItems((prev) => prev.map((i) => (i.id === itemId ? data.item : i)));
      if (previewItem && previewItem.id === itemId) {
        setPreviewItem(data.item);
      }
      showToast(`Updated sharing for "${data.item.name}" to ${shareAccess.toUpperCase()}`, 'success');
    }
  };

  // Star / Unstar
  const handleToggleStar = async (id: string) => {
    if (!authToken) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isStarred: !item.isStarred } : item))
    );
    if (previewItem && previewItem.id === id) {
      setPreviewItem((prev) => (prev ? { ...prev, isStarred: !prev.isStarred } : null));
    }

    try {
      await fetch(`/api/files/${id}/star`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (err) {
      console.error(err);
      fetchFiles();
    }
  };

  // Move to trash
  const handleTrashItem = async (id: string) => {
    if (!authToken) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isTrashed: true } : item))
    );
    try {
      await fetch(`/api/files/${id}/trash`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ isTrashed: true }),
      });
      showToast('Moved item to trash', 'info');
    } catch {
      fetchFiles();
    }
  };

  // Restore from trash
  const handleRestoreItem = async (id: string) => {
    if (!authToken) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isTrashed: false } : item))
    );
    try {
      await fetch(`/api/files/${id}/trash`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ isTrashed: false }),
      });
      showToast('Restored item to Drive', 'success');
    } catch {
      fetchFiles();
    }
  };

  // Delete permanently
  const handleDeleteForever = async (id: string) => {
    if (!authToken) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showToast('Permanently deleted item', 'info');
    } catch {
      fetchFiles();
    }
  };

  // Empty trash
  const handleEmptyTrash = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/files/empty-trash', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => !i.isTrashed));
        showToast('Trash emptied successfully', 'success');
      }
    } catch {
      showToast('Failed to empty trash', 'error');
    }
  };

  // Plan upgrade
  const handleSelectPlan = async (planId: PlanId) => {
    if (!authToken) return;
    const res = await fetch('/api/user/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ planId }),
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      showToast(`Account updated to ${planId.replace('_', ' ').toUpperCase()}!`, 'success');
    }
  };

  const handleAskAiAboutFile = (file: DriveItem) => {
    setShowAiChat(true);
  };

  // Storage calculation
  const quotaBytes = currentUser ? currentUser.storageQuotaBytes : 15 * 1024 * 1024 * 1024;
  const storageSummary: StorageSummary = calculateStorageSummary(items, quotaBytes);

  // Filter items for active view
  const displayItems = filterDriveItems(items, {
    tab: activeTab,
    parentId: currentFolderId,
    searchQuery,
    categoryFilter,
    sortBy,
    sortOrder,
  });

  const activeTheme = getThemeConfig(currentThemeId);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${activeTheme.backgroundClass}`}>
      {/* Hidden File Input for Native File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        onOpenAiChat={() => setShowAiChat(true)}
        onOpenThemes={() => setShowThemesModal(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenStoragePlans={() => setShowStorageModal(true)}
        onToggleMobileMenu={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      {/* Main Drive Workspace Split */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay Drawer */}
        {showMobileSidebar && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="relative z-50 flex h-full">
              <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                storageSummary={storageSummary}
                currentUser={currentUser}
                onNewFolder={() => {
                  setShowMobileSidebar(false);
                  setShowNewFolderModal(true);
                }}
                onTriggerFileUpload={() => {
                  setShowMobileSidebar(false);
                  fileInputRef.current?.click();
                }}
                onOpenStorageModal={() => {
                  setShowMobileSidebar(false);
                  setShowStorageModal(true);
                }}
                onOpenAuthModal={(tab) => {
                  setShowMobileSidebar(false);
                  handleOpenAuth(tab);
                }}
                onCloseMobile={() => setShowMobileSidebar(false)}
                className="h-full shadow-2xl animate-in slide-in-from-left duration-200"
              />
            </div>
          </div>
        )}

        {/* Desktop Left Eyad Drive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          storageSummary={storageSummary}
          currentUser={currentUser}
          onNewFolder={() => setShowNewFolderModal(true)}
          onTriggerFileUpload={() => fileInputRef.current?.click()}
          onOpenStorageModal={() => setShowStorageModal(true)}
          onOpenAuthModal={handleOpenAuth}
          className="hidden md:flex"
        />

        {/* Center File Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DriveContent
            items={displayItems}
            activeTab={activeTab}
            currentFolderId={currentFolderId}
            folderPath={folderPath}
            onNavigateFolder={handleNavigateFolder}
            viewMode={viewMode}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onPreviewItem={(item) => setPreviewItem(item)}
            onToggleStar={handleToggleStar}
            onTrashItem={handleTrashItem}
            onRestoreItem={handleRestoreItem}
            onDeleteForever={handleDeleteForever}
            onEmptyTrash={handleEmptyTrash}
            onTriggerUpload={() => fileInputRef.current?.click()}
            onFileDrop={handleUploadFiles}
            onOpenStorageModal={() => setShowStorageModal(true)}
            onShareItem={(item) => setSharingItem(item)}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </main>
      </div>

      {/* Floating Upload Progress Widget with live Percentage & Time Remaining */}
      <UploadProgressWidget
        uploads={uploadProgressItems}
        onDismiss={() => setUploadProgressItems([])}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-gray-900 text-white border-gray-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <FilePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onToggleStar={handleToggleStar}
        onTrash={handleTrashItem}
        onAskAiAboutFile={handleAskAiAboutFile}
        onOpenShare={(item) => setSharingItem(item)}
        authToken={authToken}
      />

      <ShareModal
        item={sharingItem}
        isOpen={sharingItem !== null}
        onClose={() => setSharingItem(null)}
        onUpdateShare={handleUpdateShare}
      />

      <StoragePlansModal
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
        currentUser={currentUser}
        storageSummary={storageSummary}
        onSelectPlan={handleSelectPlan}
      />

      <AdminConsoleModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentUser={currentUser}
        authToken={authToken}
        onRefreshData={fetchFiles}
      />

      <AIChatDrawer
        isOpen={showAiChat}
        onClose={() => setShowAiChat(false)}
        currentUser={currentUser}
        authToken={authToken}
        onNavigateToTab={(tab) => handleTabChange(tab as SidebarTab)}
        onSearchRequest={(query) => setSearchQuery(query)}
      />

      <AuthModal
        isOpen={showAuthModal}
        initialTab={authModalTab}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <ThemeSelectorModal
        isOpen={showThemesModal}
        onClose={() => setShowThemesModal(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={(themeId) => {
          setCurrentThemeId(themeId);
          localStorage.setItem('eyad_drive_theme', themeId);
          showToast(`Theme applied: ${getThemeConfig(themeId).name}`, 'success');
        }}
        currentUser={currentUser}
        onOpenUpgradeModal={() => setShowStorageModal(true)}
        onOpenAuthAdmin={() => handleOpenAuth('admin')}
      />
    </div>
  );
}
