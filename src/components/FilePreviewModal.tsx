import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  FileSpreadsheet,
  File,
  Sparkles,
  Info,
  Maximize2,
  Check,
  Copy,
  ExternalLink,
  Share2,
  Lock,
  Globe,
} from 'lucide-react';
import { DriveItem } from '../types/drive';
import { formatBytes } from '../utils/driveLogic';

interface FilePreviewModalProps {
  item: DriveItem | null;
  onClose: () => void;
  onToggleStar: (id: string) => void;
  onTrash: (id: string) => void;
  onAskAiAboutFile: (item: DriveItem) => void;
  onOpenShare?: (item: DriveItem) => void;
  authToken?: string | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  item,
  onClose,
  onToggleStar,
  onTrash,
  onAskAiAboutFile,
  onOpenShare,
  authToken,
}) => {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  if (!item) return null;

  const handleCopyText = () => {
    if (item.textContent) {
      navigator.clipboard.writeText(item.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    switch (item.category) {
      case 'image':
        return (
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-950/80 overflow-auto">
            <img
              src={item.previewUrl || `https://picsum.photos/seed/${item.id}/800/600`}
              alt={item.name}
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex-1 flex items-center justify-center p-6 bg-black">
            <video
              controls
              autoPlay={false}
              src={item.previewUrl}
              className="max-h-[70vh] max-w-full rounded-lg shadow-2xl"
            >
              Your browser does not support HTML5 video preview.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-b from-gray-900 to-gray-950 text-white">
            <div className="w-24 h-24 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-6 shadow-inner animate-pulse">
              <Music className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-xs mb-8">{formatBytes(item.sizeBytes)} • Audio Stream</p>
            <audio controls src={item.previewUrl} className="w-full max-w-md">
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      case 'spreadsheet':
        if (item.textContent) {
          const rows = item.textContent
            .trim()
            .split('\n')
            .map((r) => r.split(','));
          return (
            <div className="flex-1 overflow-auto p-6 bg-white">
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/70 border-b border-gray-200 text-emerald-900">
                      {rows[0]?.map((cell, idx) => (
                        <th key={idx} className="p-3 font-semibold border-r border-gray-200 last:border-r-0">
                          {cell.trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-gray-100 hover:bg-gray-50/80">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 border-r border-gray-100 last:border-r-0 text-gray-700">
                            {cell.trim()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        break;

      case 'code':
      case 'document':
        if (item.textContent) {
          const lines = item.textContent.split('\n');
          return (
            <div className="flex-1 overflow-auto p-6 bg-gray-900 text-gray-100 font-mono text-xs relative">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                <span className="text-[11px] text-gray-400">
                  {lines.length} lines • UTF-8 Document
                </span>
                <button
                  onClick={handleCopyText}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Content'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono">
                {lines.map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-10 select-none text-gray-600 text-right pr-4">{idx + 1}</span>
                    <span className="flex-1">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          );
        }
        break;

      default:
        break;
    }

    // Default rich fallback preview card
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 shadow-md flex items-center justify-center mb-4">
          <File className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">{item.name}</h3>
        <p className="text-xs text-gray-500 mb-6">
          {formatBytes(item.sizeBytes)} • {item.mimeType || 'Binary file'}
        </p>

        <div className="flex gap-3">
          {item.downloadUrl && (
            <a
              href={item.downloadUrl}
              download={item.name}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </a>
          )}
          <button
            onClick={() => onAskAiAboutFile(item)}
            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Ask Drive Copilot</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="h-14 border-b border-gray-200 px-4 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onToggleStar(item.id)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-amber-500 cursor-pointer transition"
              title={item.isStarred ? 'Unstar' : 'Star'}
            >
              <Star
                className={`w-5 h-5 ${
                  item.isStarred ? 'text-amber-500 fill-amber-400' : 'text-gray-400'
                }`}
              />
            </button>
            <div className="truncate">
              <h2 className="text-sm font-bold text-gray-900 truncate">{item.name}</h2>
              <span className="text-[11px] text-gray-500">
                {formatBytes(item.sizeBytes)} • {item.category.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Share button */}
            {onOpenShare && (
              <button
                onClick={() => onOpenShare(item)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                title="Share this file"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            )}

            {/* Ask AI quick action */}
            <button
              onClick={() => onAskAiAboutFile(item)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              title="Ask Gemini Copilot to explain or summarize this file"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask AI</span>
            </button>

            {item.downloadUrl && (
              <a
                href={authToken ? `${item.downloadUrl}?token=${authToken}` : item.downloadUrl}
                download={item.name}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer transition"
                title="Download file securely"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg cursor-pointer transition ${
                showInfo ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Toggle file details"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onTrash(item.id);
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer transition"
              title="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer transition"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Center: Preview Body + Info Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Preview Container */}
          <div className="flex-1 flex flex-col overflow-hidden">{renderContent()}</div>

          {/* Right Info Drawer */}
          {showInfo && (
            <div className="w-72 border-l border-gray-200 bg-gray-50/70 p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">File Details</h4>
                <p className="text-gray-500 text-[11px]">Synced across all your authorized devices</p>
              </div>

              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Type
                  </span>
                  <span className="font-medium text-gray-800 capitalize">{item.category}</span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    File Size
                  </span>
                  <span className="font-medium text-gray-800">{formatBytes(item.sizeBytes)}</span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Storage Used
                  </span>
                  <span className="font-medium text-gray-800">{item.sizeBytes.toLocaleString()} bytes</span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Created / Uploaded
                  </span>
                  <span className="font-medium text-gray-800">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Cross-Device Status
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Synchronized in Cloud</span>
                  </div>
                </div>
              </div>

              {/* Quick AI Assist Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Gemini AI Insights</span>
                </div>
                <p className="text-[11px] text-blue-800/80 leading-relaxed">
                  Have Drive Copilot summarize, explain formulas, or extract keywords from this file.
                </p>
                <button
                  onClick={() => onAskAiAboutFile(item)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs"
                >
                  Analyze with AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
