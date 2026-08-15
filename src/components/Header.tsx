import React from 'react';
import { Smartphone, Download, BookOpen, Layers, Sparkles } from 'lucide-react';
import { AppConfig } from '../types';

interface HeaderProps {
  config: AppConfig;
  onOpenBuild: () => void;
  onOpenGuide: () => void;
  onOpenPresets: () => void;
  onOpenCloudSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenBuild,
  onOpenGuide,
  onOpenPresets,
  onOpenCloudSetup,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">
                Web<span className="text-blue-400">To</span>APK
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                Studio v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Turn any web app into an ultra-fast Android APK
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-header-presets"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
            title="Load popular preset apps"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Presets</span>
          </button>

          <button
            id="btn-header-cloud-setup"
            onClick={onOpenCloudSetup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-blue-300 hover:text-blue-200 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-lg transition-all"
            title="Free Cloud Build & Setup Guide"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Free Cloud Setup</span>
          </button>

          <button
            id="btn-header-guide"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
            title="Installation and Sideloading Guide"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Install Guide</span>
          </button>

          <button
            id="btn-header-build"
            onClick={onOpenBuild}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4" />
            <span>Generate APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
