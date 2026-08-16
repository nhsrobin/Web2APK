import React from 'react';
import { Smartphone, Download, BookOpen } from 'lucide-react';
import { AppConfig } from '../types';

interface HeaderProps {
  config: AppConfig;
  onOpenBuild: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenBuild,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/20 shrink-0">
            <Smartphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">
              Web<span className="text-blue-400">To</span>APK
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="btn-header-guide"
            onClick={onOpenGuide}
            className="flex items-center justify-center p-[5px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
            title="Installation and Documentation Guide"
            aria-label="Documentation"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            id="btn-header-build"
            onClick={onOpenBuild}
            className="flex items-center gap-1 px-[8px] py-[5px] text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Build APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};

