import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { THEMES_LIST, ThemeConfig } from '../types/theme';
import { User } from '../types/drive';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  currentUser: User | null;
  onOpenUpgradeModal: () => void;
  onOpenAuthAdmin: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  currentUser,
  onOpenUpgradeModal,
  onOpenAuthAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  // Access rule: Only Admin and Ultimate Pro (1 TB) users have theme access
  const hasAccess =
    currentUser?.role === 'admin' ||
    currentUser?.planId === 'ultimate_pro' ||
    currentUser?.username.toLowerCase() === 'eyad.eliwa' ||
    currentUser?.isPlanCompedByAdmin === true;

  const categories = ['All', 'Special', 'Space & Nature', 'Neon & Tech', 'Aesthetic & Pastel', 'Dark & Luxe'];

  const filteredThemes =
    selectedCategory === 'All'
      ? THEMES_LIST
      : THEMES_LIST.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Theme Studio (26 Custom Themes)</h2>
                {hasAccess ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">
                    Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-300 text-stone-950 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Admin &amp; Ultimate Pro Exclusive
                  </span>
                )}
              </div>
              <p className="text-purple-100 text-xs mt-0.5">
                Customize Eyad Drive with 26 handcrafted backgrounds, dark modes, and aesthetic atmospheres
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close themes modal"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Banner if user lacks permissions */}
        {!hasAccess && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Themes are reserved for Admin and Ultimate Pro (1 TB) accounts!
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Upgrade to Ultimate Pro (1 TB) or sign in as Admin Eyad.Eliwa to unlock all 26 themes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgradeModal();
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition whitespace-nowrap"
              >
                Upgrade to Ultimate Pro
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthAdmin();
                }}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold cursor-pointer transition whitespace-nowrap"
              >
                Admin Sign-In
              </button>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Themes Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredThemes.map((theme, index) => {
              const isSelected = currentThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    if (hasAccess) {
                      onSelectTheme(theme.id);
                    }
                  }}
                  className={`group relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 ${
                    hasAccess ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'opacity-80'
                  } ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-500/30 shadow-md bg-purple-50/20'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div>
                    {/* Visual Card Preview Mini-Window */}
                    <div
                      className={`h-24 rounded-xl p-2.5 mb-3 flex flex-col justify-between border ${theme.backgroundClass} shadow-inner overflow-hidden relative`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 backdrop-blur-xs font-bold">
                          #{index + 1}
                        </span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                          style={{ backgroundColor: theme.previewColor }}
                        />
                      </div>

                      {/* Mock mini layout */}
                      <div className="space-y-1">
                        <div className="h-2 w-12 bg-white/30 rounded-full" />
                        <div className="h-2 w-20 bg-white/20 rounded-full" />
                      </div>

                      {/* Lock overlay if no access */}
                      {!hasAccess && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                          <Lock className="w-5 h-5 text-amber-300 drop-shadow-md" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-purple-700 transition">
                        {theme.name}
                      </h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mb-3">
                      {theme.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-gray-400">{theme.category}</span>
                    <button
                      disabled={!hasAccess}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasAccess) onSelectTheme(theme.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-purple-100 text-purple-700'
                          : hasAccess
                          ? 'bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? 'Applied' : hasAccess ? 'Apply' : 'Locked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
