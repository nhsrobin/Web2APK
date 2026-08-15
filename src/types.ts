export type DisplayMode = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
export type ScreenOrientation = 'portrait' | 'landscape' | 'sensor' | 'unlocked';
export type SplashDuration = 1 | 2 | 3 | 4 | 'load';
export type LoaderStyle = 'spinner' | 'pulse' | 'bar' | 'dots' | 'none';
export type IconShape = 'squircle' | 'circle' | 'rounded' | 'square' | 'teardrop';

export interface AppConfig {
  // General & Target
  url: string;
  name: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  category: string;
  description: string;

  // Icon Configuration
  icon: {
    type: 'preset' | 'custom' | 'generated';
    presetIconName: string; // Lucide icon name
    customDataUrl: string | null;
    backgroundColor: string;
    iconColor: string;
    shape: IconShape;
    scale: number; // 0.5 to 1.0
  };

  // Splash Screen
  splash: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    duration: SplashDuration;
    loaderStyle: LoaderStyle;
    showAppName: boolean;
    tagline: string;
    accentColor: string;
  };

  // UI & Experience
  ui: {
    displayMode: DisplayMode;
    themeColor: string;
    statusBarColor: string;
    statusBarLightIcons: boolean;
    navBarColor: string;
    orientation: ScreenOrientation;
    pullToRefresh: boolean;
    keepScreenAwake: boolean;
    enableZoom: boolean;
    hardwareAcceleration: boolean;
    showExitConfirm: boolean;
    openExternalInBrowser: boolean;
    customUserAgent: string;
    useCustomUserAgent: boolean;
  };

  // Permissions
  permissions: {
    camera: boolean;
    location: boolean;
    microphone: boolean;
    storage: boolean;
    notifications: boolean;
    vibration: boolean;
    biometrics: boolean;
  };

  // Offline Experience
  offline: {
    enabled: boolean;
    offlineTitle: string;
    offlineMessage: string;
    showRetryButton: boolean;
    offlineColor: string;
    customOfflineHtml?: string;
  };

  // Build & Keystore Signing
  build: {
    signApk: boolean;
    keystoreAlias: string;
    minSdkVersion: number;
    targetSdkVersion: number;
    enableTWA: boolean; // Trusted Web Activity vs Native WebView
  };
}

export interface BuildLog {
  id: string;
  timestamp: string;
  stage: 'init' | 'manifest' | 'dex' | 'resources' | 'sign' | 'package' | 'done' | 'error';
  message: string;
  progress: number;
}
