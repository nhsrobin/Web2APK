import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Smartphone,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AppConfig } from '../types';
import { renderIconToCanvas } from '../lib/iconGenerator';

interface DeviceSimulatorProps {
  config: AppConfig;
  forceSplashReplayKey?: number;
  forceOffline?: boolean;
  onToggleOffline?: () => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  config,
  forceSplashReplayKey = 0,
  forceOffline = false,
  onToggleOffline,
}) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [iconDataUrl, setIconDataUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Update status bar clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update Icon preview
  useEffect(() => {
    let active = true;
    renderIconToCanvas(config.icon, 256, true).then((canvas) => {
      if (active) {
        setIconDataUrl(canvas.toDataURL('image/png'));
      }
    });
    return () => {
      active = false;
    };
  }, [config.icon]);

  // Handle splash screen display & timeout
  useEffect(() => {
    if (config.splash.enabled) {
      setShowSplash(true);
      const durationMs =
        config.splash.duration === 'load' ? 2200 : Number(config.splash.duration) * 1000;
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, durationMs);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [config.splash.enabled, config.splash.duration, forceSplashReplayKey]);

  const handlePullToRefresh = () => {
    if (!config.ui.pullToRefresh) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIframeKey((k) => k + 1);
      setIsRefreshing(false);
    }, 800);
  };

  const formattedUrl = config.url
    ? config.url.startsWith('http')
      ? config.url
      : `https://${config.url}`
    : 'https://example.com';

  return (
    <div className="flex flex-col items-center">
      {/* Device Toolbar Controls */}
      <div className="w-full max-w-sm flex items-center justify-between px-2 py-1.5 mb-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSplash(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1"
            title="Replay Splash Screen"
          >
            <Play className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            <span className="text-[11px] hidden sm:inline">Splash</span>
          </button>

          {onToggleOffline && (
            <button
              type="button"
              onClick={onToggleOffline}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                forceOffline
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Toggle Offline Network Simulation"
            >
              {forceOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-[11px] hidden sm:inline">
                {forceOffline ? 'Offline' : 'Online'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLandscape((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1"
            title="Rotate Device"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] hidden sm:inline">Rotate</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Reload Webview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={formattedUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div
        className={`relative transition-all duration-300 ease-in-out shadow-2xl shadow-blue-500/10 rounded-[36px] sm:rounded-[44px] p-2.5 sm:p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-700/80 ring-1 ring-white/10 ${
          isLandscape ? 'w-full max-w-[600px] h-[320px]' : 'w-[290px] min-[380px]:w-[320px] sm:w-[350px] h-[580px] sm:h-[660px]'
        }`}
      >
        {/* Outer Phone Shell */}
        <div className="relative w-full h-full bg-slate-950 rounded-[28px] sm:rounded-[34px] overflow-hidden flex flex-col border border-slate-800">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-blue-950 border border-blue-900" />
          </div>

          {/* Android Status Bar (Unless Immersive Fullscreen) */}
          {config.ui.displayMode !== 'fullscreen' && (
            <div
              className="h-7 px-5 flex items-center justify-between text-[11px] font-semibold shrink-0 z-20 transition-colors"
              style={{
                backgroundColor: config.ui.statusBarColor,
                color: config.ui.statusBarLightIcons ? '#ffffff' : '#0f172a',
              }}
            >
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                {forceOffline ? (
                  <WifiOff className="w-3 h-3 text-red-400" />
                ) : (
                  <Wifi className="w-3 h-3" />
                )}
                <Signal className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Web Browser Top Bar (If Browser mode selected) */}
          {config.ui.displayMode === 'browser' && (
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center gap-2 shrink-0 z-20">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <div className="flex-1 bg-slate-950 px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-mono truncate border border-slate-800">
                {formattedUrl}
              </div>
              <RotateCcw
                className="w-3.5 h-3.5 text-slate-400 cursor-pointer"
                onClick={() => setIframeKey((k) => k + 1)}
              />
            </div>
          )}

          {/* Screen Body Area */}
          <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
            {/* Pull to Refresh Indicator */}
            {isRefreshing && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-blue-600 text-white rounded-full text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Refreshing...</span>
              </div>
            )}

            {/* Offline Fallback Screen View */}
            {forceOffline ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 shadow-lg">
                  <WifiOff className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {config.offline.offlineTitle || 'No Connection'}
                </h3>
                <p className="text-xs text-slate-400 max-w-[220px] mb-5 leading-relaxed">
                  {config.offline.offlineMessage || 'Please check your internet and try again.'}
                </p>
                {config.offline.showRetryButton && (
                  <button
                    type="button"
                    onClick={onToggleOffline}
                    className="w-full max-w-[200px] py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95"
                    style={{ backgroundColor: config.ui.themeColor }}
                  >
                    Tap to Reconnect
                  </button>
                )}
                <span className="text-[10px] text-slate-600 mt-4 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Native Offline Cache Active
                </span>
              </div>
            ) : (
              /* Live Webview Iframe */
              <div
                className="w-full h-full relative"
                onClick={handlePullToRefresh}
                title={config.ui.pullToRefresh ? 'Click to simulate Pull to Refresh' : undefined}
              >
                <iframe
                  key={iframeKey}
                  src={formattedUrl}
                  title="App Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            )}

            {/* Native Launch Splash Screen Overlay */}
            {showSplash && config.splash.enabled && (
              <div
                className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center transition-opacity duration-300"
                style={{ backgroundColor: config.splash.backgroundColor }}
              >
                {/* Splash Logo */}
                <div className="relative mb-4">
                  {iconDataUrl ? (
                    <img
                      src={iconDataUrl}
                      alt="App Splash Logo"
                      className={`w-20 h-20 shadow-2xl ${
                        config.splash.loaderStyle === 'pulse' ? 'animate-pulse' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-blue-600 animate-pulse" />
                  )}
                </div>

                {/* App Name */}
                {config.splash.showAppName && (
                  <h2
                    className="text-lg font-bold tracking-tight mb-1"
                    style={{ color: config.splash.textColor }}
                  >
                    {config.name || 'Web App'}
                  </h2>
                )}

                {/* Tagline */}
                {config.splash.tagline && (
                  <p className="text-xs text-slate-400 max-w-[220px] mb-6">
                    {config.splash.tagline}
                  </p>
                )}

                {/* Loader Style */}
                <div className="mt-2">
                  {config.splash.loaderStyle === 'spinner' && (
                    <div
                      className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: `${config.splash.accentColor} transparent transparent transparent`,
                        borderRightColor: config.splash.accentColor,
                      }}
                    />
                  )}
                  {config.splash.loaderStyle === 'bar' && (
                    <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full w-1/2 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                        style={{ backgroundColor: config.splash.accentColor }}
                      />
                    </div>
                  )}
                  {config.splash.loaderStyle === 'dots' && (
                    <div className="flex gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: config.splash.accentColor }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]"
                        style={{ backgroundColor: config.splash.accentColor }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]"
                        style={{ backgroundColor: config.splash.accentColor }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Android Navigation Bar (Pill Home Bar) */}
          <div
            className="h-5 flex items-center justify-center shrink-0 z-20 transition-colors"
            style={{ backgroundColor: config.ui.navBarColor }}
          >
            <div className="w-28 h-1 bg-slate-400/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Device Specs Pill */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
          APK Size: ~240 KB
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
          Min API: {config.build.minSdkVersion}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
          Target API: {config.build.targetSdkVersion}
        </span>
      </div>
    </div>
  );
};
