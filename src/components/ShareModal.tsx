import React, { useState } from 'react';
import {
  X,
  Share2,
  Lock,
  Globe,
  Copy,
  Check,
  UserPlus,
  Trash2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { DriveItem, ShareAccess } from '../types/drive';

interface ShareModalProps {
  item: DriveItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateShare?: (
    itemId: string,
    shareAccess: ShareAccess,
    sharedWithUsernames: string[]
  ) => Promise<void>;
  onSaveShareSettings?: (
    itemId: string,
    shareAccess: ShareAccess,
    sharedWithUsernames: string[]
  ) => Promise<void>;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdateShare,
  onSaveShareSettings,
}) => {
  if (!isOpen || !item) return null;

  const [shareAccess, setShareAccess] = useState<ShareAccess>(item.shareAccess || 'private');
  const [usernames, setUsernames] = useState<string[]>(item.sharedWithUsernames || []);
  const [newUsername, setNewUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const shareUrl = `${window.location.origin}/?share=${item.id}`;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) return;
    if (!usernames.map((u) => u.toLowerCase()).includes(trimmed.toLowerCase())) {
      setUsernames([...usernames, trimmed]);
    }
    setNewUsername('');
  };

  const handleRemoveUser = (usernameToRemove: string) => {
    setUsernames(usernames.filter((u) => u !== usernameToRemove));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveFn = onUpdateShare || onSaveShareSettings;
      if (saveFn) {
        await saveFn(item.id, shareAccess, usernames);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save share settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-gray-900">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Share "{item.name}"</h3>
              <p className="text-xs text-gray-500">Configure private or public access permissions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Access Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              General Access
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShareAccess('private')}
                className={`p-3.5 rounded-2xl border flex flex-col text-left transition cursor-pointer ${
                  shareAccess === 'private'
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lock className={`w-4 h-4 ${shareAccess === 'private' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-bold text-xs text-gray-900">Private</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Only you and people specifically added have access
                </p>
              </button>

              <button
                type="button"
                onClick={() => setShareAccess('public')}
                className={`p-3.5 rounded-2xl border flex flex-col text-left transition cursor-pointer ${
                  shareAccess === 'public'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className={`w-4 h-4 ${shareAccess === 'public' ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className="font-bold text-xs text-gray-900">Public</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Anyone with the link can preview and download
                </p>
              </button>
            </div>
          </div>

          {/* Add People Form */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Share with Specific People
            </label>
            <form onSubmit={handleAddUser} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter username (e.g. alex.morgan)"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={!newUsername.trim()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* User List */}
            {usernames.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
                {usernames.map((u) => (
                  <div
                    key={u}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <span className="font-semibold text-gray-800 font-mono">@{u}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(u)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                      title="Remove access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copy Link Section */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Shareable Link
              </span>
              <p className="text-xs text-gray-700 font-mono truncate">{shareUrl}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                copied ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save & Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
