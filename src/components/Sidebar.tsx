import React, { useState } from 'react';
import {
  Plus,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Cloud,
  ShieldCheck,
  FolderPlus,
  Upload,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { StorageSummary, User } from '../types/drive';

export type SidebarTab =
  | 'my-drive'
  | 'shared'
  | 'recent'
  | 'starred'
  | 'trash'
  | 'storage'
  | 'admin';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  storageSummary: StorageSummary;
  currentUser: User | null;
  onNewFolder: () => void;
  onTriggerFileUpload: () => void;
  onOpenStorageModal: () => void;
  onOpenAuthModal: (tab?: 'signin' | 'admin' | 'signup') => void;
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  storageSummary,
  currentUser,
  onNewFolder,
  onTriggerFileUpload,
  onOpenStorageModal,
  onOpenAuthModal,
  className = '',
  onCloseMobile,
}) => {
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  const navItems = [
    { id: 'my-drive', label: 'My Drive', icon: HardDrive },
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'storage', label: 'Storage', icon: Cloud },
  ];

  const isAdmin = currentUser?.role === 'admin';

  const handleNavClick = (tab: SidebarTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`w-64 flex-shrink-0 bg-white border-r border-gray-200/80 p-3 flex flex-col justify-between select-none ${className}`}>
      <div className="space-y-4">
        {/* "+ New" Dropdown Pill Button */}
        <div className="relative">
          <button
            onClick={() => setShowNewDropdown(!showNewDropdown)}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg text-gray-800 font-medium text-sm transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 36 36">
                <path fill="#4285F4" d="M16 16v14h4V20z" />
                <path fill="#34A853" d="M30 16H20l-4 4h14z" />
                <path fill="#FBBC05" d="M6 16h10l4-4H6z" />
                <path fill="#EA4335" d="M20 16V6h-4v14z" />
                <path fill="none" d="M0 0h36v36H0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 tracking-wide">New</span>
          </button>

          {showNewDropdown && (
            <div className="absolute left-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setShowNewDropdown(false);
                  onNewFolder();
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <span>New folder</span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                onClick={() => {
                  setShowNewDropdown(false);
                  onTriggerFileUpload();
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>File upload</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as SidebarTab)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? item.id === 'starred'
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* Admin Management Tab (Always accessible or highlighted for Eyad.Eliwa) */}
          <div className="pt-2 mt-2 border-t border-gray-100">
            <button
              onClick={() => {
                if (isAdmin) {
                  handleNavClick('admin');
                } else {
                  onOpenAuthModal('admin');
                  if (onCloseMobile) onCloseMobile();
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-amber-700 hover:bg-amber-50/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Tab</span>
              </div>
              {isAdmin ? (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  Live
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 font-medium">Sign in</span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Storage Meter & Upgrade Banner */}
      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Storage</span>
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase">
            {currentUser?.planId ? currentUser.planId.replace('_', ' ') : 'Free'}
          </span>
        </div>

        {/* Progress Bar */}
        {storageSummary.isUnlimited ? (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full animate-pulse" />
            </div>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <span>Unlimited Storage Active</span>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  storageSummary.percentageUsed > 90
                    ? 'bg-red-500'
                    : storageSummary.percentageUsed > 75
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(3, storageSummary.percentageUsed))}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-600">
              <span className="font-semibold text-gray-900">{storageSummary.formattedUsed}</span> of{' '}
              <span className="font-semibold text-gray-900">{storageSummary.formattedQuota}</span> used
            </p>
          </div>
        )}

        <button
          onClick={onOpenStorageModal}
          className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-gray-100 border border-gray-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <span>Buy storage</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </div>
    </aside>
  );
};
