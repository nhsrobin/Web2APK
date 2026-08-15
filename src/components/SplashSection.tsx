import React from 'react';
import { Play, Sparkles, Sliders, Palette, Eye } from 'lucide-react';
import { AppConfig, LoaderStyle, SplashDuration } from '../types';

interface SplashSectionProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
  onTriggerSplashPreview: () => void;
}

const LOADER_STYLES: { id: LoaderStyle; label: string }[] = [
  { id: 'spinner', label: 'Spinner' },
  { id: 'pulse', label: 'Pulse Logo' },
  { id: 'bar', label: 'Progress Bar' },
  { id: 'dots', label: 'Dots' },
  { id: 'none', label: 'None' },
];

const DURATIONS: { id: SplashDuration; label: string }[] = [
  { id: 1, label: '1 sec' },
  { id: 2, label: '2 sec' },
  { id: 3, label: '3 sec' },
  { id: 'load', label: 'Until Loaded' },
];

export const SplashSection: React.FC<SplashSectionProps> = ({
  config,
  onChange,
  onTriggerSplashPreview,
}) => {
  const splash = config.splash;

  const updateSplash = (updates: Partial<typeof splash>) => {
    onChange({
      splash: { ...splash, ...updates },
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm sm:text-base">
              Native Splash Screen
            </h2>
            <p className="text-xs text-slate-400">
              Customize startup launch animation, colors, and loading indicator
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTriggerSplashPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
          title="Test Splash in Simulator"
        >
          <Play className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <span>Replay in Device</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Enable / Disable Switch */}
        <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              Enable Launch Splash Screen
            </span>
            <span className="text-[11px] text-slate-400 block">
              Smoothly transition into the webview while assets load
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={splash.enabled}
              onChange={(e) => updateSplash({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>

        {splash.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Background Color */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Splash Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={splash.backgroundColor}
                  onChange={(e) => updateSplash({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={splash.backgroundColor}
                  onChange={(e) => updateSplash({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Accent / Loader Color */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Accent / Spinner Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={splash.accentColor}
                  onChange={(e) => updateSplash({ accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={splash.accentColor}
                  onChange={(e) => updateSplash({ accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Display Duration
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATIONS.map((dur) => (
                  <button
                    key={String(dur.id)}
                    type="button"
                    onClick={() => updateSplash({ duration: dur.id })}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${
                      splash.duration === dur.id
                        ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loader Style */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Loading Indicator Style
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {LOADER_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateSplash({ loaderStyle: st.id })}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${
                      splash.loaderStyle === st.id
                        ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tagline / Subtitle */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Splash Tagline / Subtitle
              </label>
              <input
                type="text"
                value={splash.tagline}
                onChange={(e) => updateSplash({ tagline: e.target.value })}
                placeholder="e.g. Fast & Secure Mobile Experience"
                maxLength={45}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl text-slate-100 text-sm placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
