import React, { useState } from 'react';
import {
  Sliders,
  Maximize2,
  RefreshCw,
  SunMedium,
  Compass,
  ShieldCheck,
  WifiOff,
  Terminal,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppConfig, DisplayMode, ScreenOrientation } from '../types';

interface CustomizationSectionProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
  onTriggerOfflineTest: () => void;
}

const DISPLAY_MODES: { id: DisplayMode; label: string; desc: string }[] = [
  {
    id: 'standalone',
    label: 'Standalone App',
    desc: 'Looks and feels like a native mobile app with system status bar',
  },
  {
    id: 'fullscreen',
    label: 'Immersive Fullscreen',
    desc: 'Hides status bar and navigation for games & full-canvas apps',
  },
  {
    id: 'minimal-ui',
    label: 'Minimal UI',
    desc: 'Shows minimal navigation indicators with slim status bar',
  },
  {
    id: 'browser',
    label: 'Browser Mode',
    desc: 'Includes top URL bar and standard forward/back navigation',
  },
];

const ORIENTATIONS: { id: ScreenOrientation; label: string }[] = [
  { id: 'portrait', label: 'Lock Portrait' },
  { id: 'landscape', label: 'Lock Landscape' },
  { id: 'sensor', label: 'Sensor Auto-Rotate' },
  { id: 'unlocked', label: 'System Default' },
];

export const CustomizationSection: React.FC<CustomizationSectionProps> = ({
  config,
  onChange,
  onTriggerOfflineTest,
}) => {
  const [activeTab, setActiveTab] = useState<'ui' | 'permissions' | 'offline' | 'advanced'>('ui');

  const updateUi = (updates: Partial<AppConfig['ui']>) => {
    onChange({ ui: { ...config.ui, ...updates } });
  };

  const updatePermissions = (updates: Partial<AppConfig['permissions']>) => {
    onChange({ permissions: { ...config.permissions, ...updates } });
  };

  const updateOffline = (updates: Partial<AppConfig['offline']>) => {
    onChange({ offline: { ...config.offline, ...updates } });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">
              App Customization & Hardware
            </h2>
            <p className="text-[11px] text-slate-400">
              Configure display modes, gestures, native hardware permissions & offline caching
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-3 overflow-x-auto scrollbar-none gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('ui')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'ui'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Display & Navigation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'permissions'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Hardware Permissions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offline')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'offline'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Offline Experience
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'advanced'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Advanced & Engine
        </button>
      </div>

      {/* Tab: UI & Navigation */}
      {activeTab === 'ui' && (
        <div className="space-y-4">
          {/* Display Mode Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              App Window Display Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DISPLAY_MODES.map((mode) => {
                const isSelected = config.ui.displayMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => updateUi({ displayMode: mode.id })}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/20'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100">
                        {mode.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {mode.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation Lock */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Screen Orientation Lock
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ORIENTATIONS.map((ori) => (
                <button
                  key={ori.id}
                  type="button"
                  onClick={() => updateUi({ orientation: ori.id })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    config.ui.orientation === ori.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                  }`}
                >
                  {ori.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Bar & Nav Bar Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status Bar Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.ui.statusBarColor}
                  onChange={(e) => updateUi({ statusBarColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={config.ui.statusBarColor}
                  onChange={(e) => updateUi({ statusBarColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Theme / Brand Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.ui.themeColor}
                  onChange={(e) => updateUi({ themeColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={config.ui.themeColor}
                  onChange={(e) => updateUi({ themeColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2 pt-2">
            <ToggleOption
              id="toggle-pull-to-refresh"
              title="Pull-to-Refresh Gesture"
              subtitle="Allow users to swipe down to reload web content"
              checked={config.ui.pullToRefresh}
              onChange={(c) => updateUi({ pullToRefresh: c })}
            />
            <ToggleOption
              id="toggle-keep-awake"
              title="Keep Screen Awake (WakeLock)"
              subtitle="Prevent phone screen from sleeping while app is open"
              checked={config.ui.keepScreenAwake}
              onChange={(c) => updateUi({ keepScreenAwake: c })}
            />
            <ToggleOption
              id="toggle-pinch-zoom"
              title="Support Pinch-to-Zoom"
              subtitle="Enable multi-touch zoom controls in WebView"
              checked={config.ui.enableZoom}
              onChange={(c) => updateUi({ enableZoom: c })}
            />
            <ToggleOption
              id="toggle-exit-confirm"
              title="Confirm on Back Button Exit"
              subtitle="Prompt before closing app when no history is left"
              checked={config.ui.showExitConfirm}
              onChange={(c) => updateUi({ showExitConfirm: c })}
            />
          </div>
        </div>
      )}

      {/* Tab: Hardware Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400 mb-2">
            Select native Android hardware APIs required by your web application.
            Unused permissions are automatically omitted to keep the APK small and secure.
          </p>

          <ToggleOption
            id="perm-camera"
            title="Camera Access (android.permission.CAMERA)"
            subtitle="Required for QR scanners, photo uploads, and WebRTC video"
            checked={config.permissions.camera}
            onChange={(c) => updatePermissions({ camera: c })}
          />
          <ToggleOption
            id="perm-location"
            title="Location / GPS (android.permission.ACCESS_FINE_LOCATION)"
            subtitle="Allows HTML5 navigator.geolocation positioning"
            checked={config.permissions.location}
            onChange={(c) => updatePermissions({ location: c })}
          />
          <ToggleOption
            id="perm-microphone"
            title="Microphone & Audio (android.permission.RECORD_AUDIO)"
            subtitle="Required for voice chat, recording, and speech recognition"
            checked={config.permissions.microphone}
            onChange={(c) => updatePermissions({ microphone: c })}
          />
          <ToggleOption
            id="perm-storage"
            title="File Downloads & Storage"
            subtitle="Enables native Android DownloadManager and file picking"
            checked={config.permissions.storage}
            onChange={(c) => updatePermissions({ storage: c })}
          />
          <ToggleOption
            id="perm-notifications"
            title="Push Notifications (android.permission.POST_NOTIFICATIONS)"
            subtitle="Support Android 13+ push and background notifications"
            checked={config.permissions.notifications}
            onChange={(c) => updatePermissions({ notifications: c })}
          />
          <ToggleOption
            id="perm-vibration"
            title="Haptic Feedback (android.permission.VIBRATE)"
            subtitle="Allows navigator.vibrate() tactile haptics on button clicks"
            checked={config.permissions.vibration}
            onChange={(c) => updatePermissions({ vibration: c })}
          />
        </div>
      )}

      {/* Tab: Offline Experience */}
      {activeTab === 'offline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Enable Offline Fallback Screen
              </span>
              <span className="text-[11px] text-slate-400 block">
                Gracefully renders an integrated offline screen when no internet is available
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.offline.enabled}
                onChange={(e) => updateOffline({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {config.offline.enabled && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Offline Header Title
                </label>
                <input
                  type="text"
                  value={config.offline.offlineTitle}
                  onChange={(e) => updateOffline({ offlineTitle: e.target.value })}
                  placeholder="No Internet Connection"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-slate-100 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Offline Subtitle Message
                </label>
                <textarea
                  rows={2}
                  value={config.offline.offlineMessage}
                  onChange={(e) => updateOffline({ offlineMessage: e.target.value })}
                  placeholder="Please check your Wi-Fi or mobile network and try again."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-slate-100 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <ToggleOption
                  id="toggle-show-retry-btn"
                  title="Show 'Tap to Retry' Button"
                  subtitle="Allows one-tap reconnection check"
                  checked={config.offline.showRetryButton}
                  onChange={(c) => updateOffline({ showRetryButton: c })}
                />
              </div>

              <button
                type="button"
                onClick={onTriggerOfflineTest}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold rounded-xl transition-all"
              >
                <WifiOff className="w-4 h-4 text-cyan-400" />
                <span>Test Offline Screen in Live Simulator</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Advanced & Engine */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Custom User-Agent String
              </label>
              <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ui.useCustomUserAgent}
                  onChange={(e) => updateUi({ useCustomUserAgent: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Override</span>
              </label>
            </div>
            <textarea
              rows={2}
              disabled={!config.ui.useCustomUserAgent}
              value={config.ui.customUserAgent}
              onChange={(e) => updateUi({ customUserAgent: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/70 disabled:opacity-40 rounded-xl text-slate-100 text-xs font-mono outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Minimum Android SDK
              </label>
              <input
                type="number"
                value={config.build.minSdkVersion}
                onChange={(e) =>
                  onChange({
                    build: {
                      ...config.build,
                      minSdkVersion: parseInt(e.target.value) || 24,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-100"
              />
              <span className="text-[10px] text-slate-500">
                API 24 = Android 7.0+ (98% devices)
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Android SDK
              </label>
              <input
                type="number"
                value={config.build.targetSdkVersion}
                onChange={(e) =>
                  onChange({
                    build: {
                      ...config.build,
                      targetSdkVersion: parseInt(e.target.value) || 34,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-100"
              />
              <span className="text-[10px] text-slate-500">
                API 34 = Android 14 (Play Store 2026 standard)
              </span>
            </div>
          </div>

          <ToggleOption
            id="toggle-hardware-accel"
            title="Hardware Acceleration (GPU WebGL)"
            subtitle="Boosts rendering speed for animations, 3D, and canvases"
            checked={config.ui.hardwareAcceleration}
            onChange={(c) => updateUi({ hardwareAcceleration: c })}
          />

          <ToggleOption
            id="toggle-open-external"
            title="Open External Links in Browser"
            subtitle="Keeps your domain inside app, opens external links in Chrome"
            checked={config.ui.openExternalInBrowser}
            onChange={(c) => updateUi({ openExternalInBrowser: c })}
          />
        </div>
      )}
    </div>
  );
};

interface ToggleOptionProps {
  id: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({
  id,
  title,
  subtitle,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
      <div className="pr-3">
        <span className="text-xs font-medium text-slate-200 block">
          {title}
        </span>
        <span className="text-[11px] text-slate-400 block leading-tight">
          {subtitle}
        </span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
      </label>
    </div>
  );
};
