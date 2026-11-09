import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => Promise<void>;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setLoading(true);
    try {
      await onCreateFolder(folderName.trim());
      setFolderName('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-5 space-y-4 text-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">New folder</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close new folder modal"
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            required
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Untitled folder"
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-end gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
