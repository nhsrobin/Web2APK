import React from 'react';
import { X, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { PRESET_APPS, PresetApp } from '../data/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetApp) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Preset App Templates
              </h3>
              <p className="text-xs text-slate-400">
                Load pre-configured brand styles, icons, splash screens, and colors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="py-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 pr-1">
          {PRESET_APPS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: preset.iconBg }}
                  >
                    {preset.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                      {preset.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {preset.packageName}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-850 text-slate-400">
                  {preset.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3 line-clamp-1">
                {preset.tagline}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900 text-slate-500 group-hover:text-slate-300">
                <span className="truncate max-w-[180px] font-mono text-[10px]">
                  {preset.url}
                </span>
                <div className="flex items-center gap-1 text-blue-400 font-semibold text-[11px]">
                  <span>Load Preset</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
