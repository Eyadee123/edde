import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  HardDrive,
  LogOut,
  ChevronDown,
  RefreshCw,
  FolderOpen,
  Menu,
  Palette,
} from 'lucide-react';
import { User } from '../types/drive';

interface HeaderProps {
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeToggle: () => void;
  onOpenAiChat: () => void;
  onOpenThemes?: () => void;
  onOpenAuth: (tab?: 'signin' | 'admin' | 'signup') => void;
  onLogout: () => void;
  onOpenStoragePlans: () => void;
  isSyncing?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onViewModeToggle,
  onOpenAiChat,
  onOpenThemes,
  onOpenAuth,
  onLogout,
  onOpenStoragePlans,
  isSyncing,
  onToggleMobileMenu,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categories = [
    { id: 'all', label: 'All file types' },
    { id: 'document', label: 'Documents & PDFs' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'image', label: 'Images & Photos' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio recordings' },
    { id: 'code', label: 'Code & Data' },
    { id: 'archive', label: 'Archives & ZIPs' },
  ];

  return (
    <header className="h-16 border-b border-gray-200/80 bg-white sticky top-0 z-30 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Brand & Drive Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-max">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Authentic Google Drive polygon icon recreation */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 87.3 78" className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
            </svg>
          </div>
          <span className="text-base sm:text-[19px] font-medium tracking-tight text-gray-800">
            Eyad <span className="font-semibold text-blue-600">Drive</span>
          </span>
        </div>

        {/* Sync Status Indicator */}
        <div
          title="All files synced across your connected devices"
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cross-Device Synced</span>
        </div>
      </div>

      {/* Center Search Pill (Google Drive Style) */}
      <div className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center w-full bg-gray-100/90 hover:bg-gray-200/70 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 rounded-full border border-transparent focus-within:border-transparent transition-all">
          <div className="pl-4 text-gray-500">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search in Eyad Drive (files, documents, folders, contents)..."
            className="w-full py-2.5 pl-3 pr-20 text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-500"
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Filter dropdown button */}
          <div className="relative pr-2">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-1.5 rounded-full hover:bg-gray-200 text-gray-600 cursor-pointer transition ${
                categoryFilter !== 'all' ? 'text-blue-600 bg-blue-50' : ''
              }`}
              title="Filter by file type"
              aria-label="Filter by file type"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                  Filter by Category
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryFilterChange(cat.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      categoryFilter === cat.id ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {categoryFilter === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Action Icons & User Account */}
      <div className="flex items-center gap-2">
        {/* 26 Themes Studio Button (Admin & Ultimate Pro) */}
        {onOpenThemes && (
          <button
            onClick={onOpenThemes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs shadow-xs transition cursor-pointer"
            title="Open Theme Studio (26 Themes)"
          >
            <Palette className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Themes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[9px] font-bold">
              26
            </span>
          </button>
        )}

        {/* Gemini Drive AI Assistant Trigger */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:via-purple-600/20 hover:to-indigo-600/20 border border-blue-200/80 text-blue-700 font-medium text-xs shadow-sm transition-all cursor-pointer group"
          title="Open Gemini AI Drive Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Drive Copilot</span>
          <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[9px] font-bold">
            AI
          </span>
        </button>

        {/* View Mode Toggle (Grid vs List) */}
        <button
          onClick={onViewModeToggle}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer transition"
          title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </button>

        {/* User Account Button & Dropdown */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition cursor-pointer"
              aria-label="User account menu"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                  currentUser.role === 'admin'
                    ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 ring-2 ring-amber-300'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-800 leading-tight">
                  {currentUser.username}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  {currentUser.role === 'admin' ? 'Unlimited Storage' : `${currentUser.planId.toUpperCase()} Plan`}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      currentUser.role === 'admin' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">@{currentUser.username}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Admin • Unlimited' : `${currentUser.planId} Tier`}
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenStoragePlans();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <span>Manage Storage Plans</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuth('admin');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Admin Tab (Eyad.Eliwa)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('admin')}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full flex items-center gap-1.5 cursor-pointer transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Tab</span>
            </button>
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition shadow-sm shadow-blue-200"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
