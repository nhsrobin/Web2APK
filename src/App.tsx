import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Sliders,
  CheckCircle2,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AppConfig } from './types';
import { DEFAULT_APP_CONFIG, PresetApp } from './data/presets';
import { Header } from './components/Header';
import { UrlInputSection } from './components/UrlInputSection';
import { BrandingSection } from './components/BrandingSection';
import { IconSection } from './components/IconSection';
import { SplashSection } from './components/SplashSection';
import { CustomizationSection } from './components/CustomizationSection';
import { DeviceSimulator } from './components/DeviceSimulator';
import { BuildModal } from './components/BuildModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { PresetsModal } from './components/PresetsModal';
import { CloudSetupModal } from './components/CloudSetupModal';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [isCloudSetupOpen, setIsCloudSetupOpen] = useState<boolean>(false);

  // Simulator controls
  const [splashReplayKey, setSplashReplayKey] = useState<number>(0);
  const [forceOffline, setForceOffline] = useState<boolean>(false);

  const handleConfigUpdate = (updates: Partial<AppConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleApplyPreset = (preset: PresetApp) => {
    setConfig((prev) => ({
      ...prev,
      url: preset.url,
      name: preset.name,
      packageName: preset.packageName,
      category: preset.category,
      icon: {
        ...prev.icon,
        presetIconName: preset.iconName,
        backgroundColor: preset.iconBg,
        iconColor: preset.iconColor,
        customDataUrl: null,
      },
      splash: {
        ...prev.splash,
        backgroundColor: preset.splashBg,
        accentColor: preset.themeColor,
        tagline: preset.tagline,
      },
      ui: {
        ...prev.ui,
        themeColor: preset.themeColor,
        statusBarColor: preset.splashBg,
      },
    }));
    // Replay splash to reflect changes
    setSplashReplayKey((k) => k + 1);
  };

  const handleTriggerSplash = () => {
    setForceOffline(false);
    setSplashReplayKey((k) => k + 1);
  };

  const handleToggleOffline = () => {
    setForceOffline((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        config={config}
        onOpenBuild={() => setIsBuildModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        {/* Hero Banner with Feature Highlights */}
        <div className="mb-3 sm:mb-4 p-3.5 sm:p-4.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/20 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-[11px] font-semibold mb-1">
                <Zap className="w-3 h-3" />
                <span>Standalone Native Android App Studio</span>
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-white tracking-tight">
                Turn any URL into a Dedicated Android Application
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
                Package any web application into a complete standalone Android APK with native in-app browser engine, full-screen video player, camera/file uploads, custom splash screens, and hardware acceleration.
              </p>
            </div>

            {/* Quick Presets Button & Badges */}
            <div className="flex flex-wrap md:flex-col items-start sm:items-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPresetsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-lg transition-all shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Explore App Templates</span>
              </button>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Android 14 (API 34) Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column App Builder Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">
          {/* Left Column: Configuration Forms (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            {/* 1. Target URL & Auto-Analyzer */}
            <UrlInputSection
              config={config}
              onChange={handleConfigUpdate}
              onApplyPreset={handleApplyPreset}
            />

            {/* 2. App Branding & Package Identity */}
            <BrandingSection
              config={config}
              onChange={handleConfigUpdate}
            />

            {/* 3. Icon Studio & Mipmap Generator */}
            <IconSection
              config={config}
              onChange={handleConfigUpdate}
            />

            {/* 4. Native Splash Screen Engine */}
            <SplashSection
              config={config}
              onChange={handleConfigUpdate}
              onTriggerSplashPreview={handleTriggerSplash}
            />

            {/* 5. Customization, Display Mode & Permissions */}
            <CustomizationSection
              config={config}
              onChange={handleConfigUpdate}
              onTriggerOfflineTest={handleToggleOffline}
            />

            {/* Bottom Generate Banner for Easy Access */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-xs sm:text-sm">
                  Ready to compile {config.name}?
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  Generates direct `.apk` binary, Android Studio project & iOS WebClip
                </p>
              </div>

              <button
                id="btn-bottom-build"
                onClick={() => setIsBuildModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Build & Download APK</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Live Device Simulator (5 cols on lg) */}
          <div className="lg:col-span-5 lg:sticky lg:top-18 space-y-3">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Live Device Simulator
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Interactive Preview
                </span>
              </div>

              {/* Mobile Phone Mockup */}
              <DeviceSimulator
                config={config}
                forceSplashReplayKey={splashReplayKey}
                forceOffline={forceOffline}
                onToggleOffline={handleToggleOffline}
              />

              {/* Primary Action Button under Phone */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <button
                  id="btn-sidebar-generate"
                  onClick={() => setIsBuildModalOpen(true)}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  <span>Generate & Download APK</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <BuildModal
        isOpen={isBuildModalOpen}
        config={config}
        onClose={() => setIsBuildModalOpen(false)}
        onOpenGuide={() => {
          setIsBuildModalOpen(false);
          setIsGuideModalOpen(true);
        }}
      />

      <InstallGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={handleApplyPreset}
      />

      <CloudSetupModal
        isOpen={isCloudSetupOpen}
        onClose={() => setIsCloudSetupOpen(false)}
        config={config}
      />

      {/* Footer & Watermark */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">WebToAPK</span>
            <span>•</span>
            <span>Standalone Native Android Generator</span>
          </div>

          {/* TasfiwnLabs Watermark */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Powered by</span>
            <a
              href="https://tasfiwn.nhsrobin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all inline-flex items-center gap-1"
            >
              <span>TasfiwnLabs</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-slate-300 transition-colors text-[11px]"
            >
              Android Sideloading Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="hover:text-slate-300 transition-colors text-[11px]"
            >
              Preset Templates
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
