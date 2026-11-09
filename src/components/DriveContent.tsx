import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  FileSpreadsheet,
  File,
  Star,
  Download,
  Trash2,
  RotateCcw,
  Eye,
  MoreVertical,
  ChevronRight,
  ArrowUpDown,
  Upload,
  HardDrive,
  Users,
  Clock,
  Sparkles,
  CheckCircle,
  Share2,
  Lock,
  Globe,
} from 'lucide-react';
import { DriveItem, FileCategory } from '../types/drive';
import { SidebarTab } from './Sidebar';
import { formatBytes } from '../utils/driveLogic';

interface DriveContentProps {
  items: DriveItem[];
  activeTab: SidebarTab;
  currentFolderId: string | null;
  folderPath: { id: string | null; name: string }[];
  onNavigateFolder: (folderId: string | null, name: string) => void;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  onPreviewItem: (item: DriveItem) => void;
  onToggleStar: (id: string) => void;
  onTrashItem: (id: string) => void;
  onRestoreItem: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onEmptyTrash: () => void;
  onTriggerUpload: () => void;
  onFileDrop: (files: FileList) => void;
  onOpenStorageModal: () => void;
  onShareItem?: (item: DriveItem) => void;
  sortBy: 'name' | 'modified' | 'size';
  setSortBy: (sort: 'name' | 'modified' | 'size') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export const DriveContent: React.FC<DriveContentProps> = ({
  items,
  activeTab,
  currentFolderId,
  folderPath,
  onNavigateFolder,
  viewMode,
  searchQuery,
  categoryFilter,
  onCategoryFilterChange,
  onPreviewItem,
  onToggleStar,
  onTrashItem,
  onRestoreItem,
  onDeleteForever,
  onEmptyTrash,
  onTriggerUpload,
  onFileDrop,
  onOpenStorageModal,
  onShareItem,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getCategoryIcon = (category: FileCategory, isFolder: boolean) => {
    if (isFolder) return <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />;
    switch (category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'code':
        return <Code className="w-5 h-5 text-indigo-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files);
    }
  };

  const folders = items.filter((i) => i.isFolder);
  const files = items.filter((i) => !i.isFolder);

  // Tab Title helper
  const getTabTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    switch (activeTab) {
      case 'my-drive':
        return folderPath.length > 1 ? folderPath[folderPath.length - 1].name : 'My Drive';
      case 'shared':
        return 'Shared with me';
      case 'recent':
        return 'Recent files';
      case 'starred':
        return 'Starred files';
      case 'trash':
        return 'Trash';
      case 'storage':
        return 'Storage Management';
      default:
        return 'Drive Files';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full bg-white overflow-hidden relative"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-40 bg-blue-600/10 backdrop-blur-xs border-2 border-dashed border-blue-500 rounded-2xl m-3 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg mb-3 animate-bounce">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-blue-700">Drop files anywhere to upload</p>
          <p className="text-xs text-blue-600">Files will sync to your account across all devices</p>
        </div>
      )}

      {/* Top Breadcrumb & Action Header */}
      <div className="h-14 px-6 border-b border-gray-100 flex items-center justify-between gap-4 select-none">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          {activeTab === 'my-drive' ? (
            <div className="flex items-center gap-1.5">
              {folderPath.map((crumb, idx) => (
                <React.Fragment key={crumb.id || 'root'}>
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <button
                    onClick={() => onNavigateFolder(crumb.id, crumb.name)}
                    className={`hover:text-blue-600 hover:bg-gray-100 px-2 py-1 rounded-lg transition cursor-pointer ${
                      idx === folderPath.length - 1 ? 'text-gray-900 font-bold' : 'text-gray-500'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <span className="font-bold text-gray-900 text-base">{getTabTitle()}</span>
          )}
        </div>

        {/* Toolbar: Sort, Trash Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'trash' && items.length > 0 && (
            <button
              onClick={onEmptyTrash}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          )}

          {/* Sort Menu */}
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100/70 p-1 rounded-xl">
            <button
              onClick={() => {
                if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else setSortBy('name');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition ${
                sortBy === 'name' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'modified') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else setSortBy('modified');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition ${
                sortBy === 'modified' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
              }`}
            >
              Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'size') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else setSortBy('size');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition ${
                sortBy === 'size' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
              }`}
            >
              Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Main File Explorer Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
              {activeTab === 'starred' ? (
                <Star className="w-10 h-10 text-amber-500 fill-amber-300" />
              ) : activeTab === 'trash' ? (
                <Trash2 className="w-10 h-10 text-gray-400" />
              ) : (
                <HardDrive className="w-10 h-10 text-blue-500" />
              )}
            </div>

            <h3 className="text-base font-bold text-gray-800 mb-1">
              {activeTab === 'starred'
                ? 'No starred files yet'
                : activeTab === 'trash'
                ? 'Trash is empty'
                : searchQuery
                ? 'No matches found'
                : 'A place for all your files'}
            </h3>

            <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
              {activeTab === 'starred'
                ? 'Add stars to files and folders to easily find them later.'
                : activeTab === 'trash'
                ? 'Items moved to trash will appear here. Empty trash anytime to free up storage.'
                : searchQuery
                ? `We couldn't find any file matching "${searchQuery}". Try adjusting your query.`
                : 'Drag and drop files here, or click "New" to upload from your computer.'}
            </p>

            {activeTab !== 'trash' && (
              <button
                onClick={onTriggerUpload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload a File</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Folders Section (if any) */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Folders ({folders.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onDoubleClick={() => onNavigateFolder(folder.id, folder.name)}
                      className="group flex items-center justify-between p-3 bg-gray-50/70 hover:bg-blue-50/50 border border-gray-200/80 hover:border-blue-300 rounded-xl transition cursor-pointer"
                    >
                      <div
                        className="flex items-center gap-3 min-w-0 flex-1"
                        onClick={() => onNavigateFolder(folder.id, folder.name)}
                      >
                        <Folder className="w-5 h-5 text-amber-500 fill-amber-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-800 truncate">
                          {folder.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(folder.id);
                          }}
                          className="p-1 rounded hover:bg-white text-gray-400 hover:text-amber-500 cursor-pointer"
                          title={folder.isStarred ? 'Unstar' : 'Star'}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              folder.isStarred ? 'text-amber-500 fill-amber-400' : 'text-gray-400'
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTrashItem(folder.id);
                          }}
                          className="p-1 rounded hover:bg-white text-gray-400 hover:text-red-500 cursor-pointer"
                          title="Move to trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {files.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Files ({files.length})
                </h3>

                {viewMode === 'grid' ? (
                  /* Grid View Cards */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        onDoubleClick={() => onPreviewItem(file)}
                        className="group relative flex flex-col bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                      >
                        {/* File Thumbnail or Type Preview Card */}
                        <div
                          onClick={() => onPreviewItem(file)}
                          className="h-32 bg-gray-50/90 flex items-center justify-center border-b border-gray-100 relative overflow-hidden"
                        >
                          {file.category === 'image' && file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center">
                              <div className="p-3 rounded-2xl bg-white shadow-xs border border-gray-100 mb-1">
                                {getCategoryIcon(file.category, file.isFolder)}
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {file.category}
                              </span>
                            </div>
                          )}

                          {/* Top-left Privacy Indicator Badge */}
                          <div
                            className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs ${
                              file.shareAccess === 'public'
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-black/30 text-white/90'
                            }`}
                            title={file.shareAccess === 'public' ? 'Public link active' : 'Private to owner'}
                          >
                            {file.shareAccess === 'public' ? (
                              <>
                                <Globe className="w-3 h-3" />
                                <span className="text-[9px]">Public</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span className="text-[9px]">Private</span>
                              </>
                            )}
                          </div>

                          {/* Top-right Star Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStar(file.id);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition cursor-pointer ${
                              file.isStarred
                                ? 'bg-amber-500/90 text-white'
                                : 'bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100'
                            }`}
                            title={file.isStarred ? 'Unstar' : 'Star'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                file.isStarred ? 'fill-current text-white' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* File Meta Info */}
                        <div className="p-3 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-gray-900 truncate" title={file.name}>
                              {file.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                              <span>{formatBytes(file.sizeBytes)}</span>
                              <span>•</span>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Quick Actions (Preview, Share, Trash, Download) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            {onShareItem && activeTab !== 'trash' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShareItem(file);
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-blue-600 cursor-pointer"
                                title="Share file (Private/Public)"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {activeTab === 'trash' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRestoreItem(file.id);
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-emerald-600 cursor-pointer"
                                title="Restore file"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPreviewItem(file);
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-blue-600 cursor-pointer"
                                title="Preview file"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeTab === 'trash') {
                                  onDeleteForever(file.id);
                                } else {
                                  onTrashItem(file.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                              title={activeTab === 'trash' ? 'Delete forever' : 'Move to trash'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View Table */
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-semibold select-none">
                          <th className="p-3 w-8"></th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Access</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">File Size</th>
                          <th className="p-3">Uploaded</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {files.map((file) => (
                          <tr
                            key={file.id}
                            onDoubleClick={() => onPreviewItem(file)}
                            className="hover:bg-blue-50/40 transition group cursor-pointer"
                          >
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleStar(file.id);
                                }}
                                className="text-gray-300 hover:text-amber-500 transition cursor-pointer"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    file.isStarred ? 'text-amber-500 fill-amber-400' : ''
                                  }`}
                                />
                              </button>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                {getCategoryIcon(file.category, file.isFolder)}
                                <span className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                                  {file.name}
                                </span>
                              </div>
                            </td>

                            <td className="p-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onShareItem) onShareItem(file);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                                  file.shareAccess === 'public'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {file.shareAccess === 'public' ? (
                                  <>
                                    <Globe className="w-3 h-3 text-emerald-600" />
                                    <span>Public</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 text-gray-500" />
                                    <span>Private</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="p-3 font-medium text-gray-600 capitalize">
                              {file.category}
                            </td>

                            <td className="p-3 font-medium text-gray-700">
                              {formatBytes(file.sizeBytes)}
                            </td>

                            <td className="p-3 text-gray-500">
                              {new Date(file.createdAt).toLocaleDateString()}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                {onShareItem && activeTab !== 'trash' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onShareItem(file);
                                    }}
                                    className="p-1 rounded-lg hover:bg-blue-100 text-blue-600 cursor-pointer"
                                    title="Share file"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPreviewItem(file);
                                  }}
                                  className="p-1 rounded-lg hover:bg-blue-100 text-blue-600 cursor-pointer"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {file.downloadUrl && (
                                  <a
                                    href={file.downloadUrl}
                                    download={file.name}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeTab === 'trash') {
                                      onDeleteForever(file.id);
                                    } else {
                                      onTrashItem(file.id);
                                    }
                                  }}
                                  className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                                  title={activeTab === 'trash' ? 'Delete forever' : 'Move to trash'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
