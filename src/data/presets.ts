import { AppConfig } from '../types';

export interface PresetApp {
  id: string;
  name: string;
  url: string;
  packageName: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  themeColor: string;
  splashBg: string;
  tagline: string;
  category: string;
}

export const PRESET_APPS: PresetApp[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    packageName: 'com.openai.chat',
    iconName: 'Bot',
    iconBg: '#10A37F',
    iconColor: '#FFFFFF',
    themeColor: '#10A37F',
    splashBg: '#171717',
    tagline: 'AI Chat Assistant',
    category: 'Productivity',
  },
  {
    id: 'linear',
    name: 'Linear App',
    url: 'https://linear.app',
    packageName: 'app.linear.mobile',
    iconName: 'Sparkles',
    iconBg: '#5E6AD2',
    iconColor: '#FFFFFF',
    themeColor: '#5E6AD2',
    splashBg: '#0F1015',
    tagline: 'Issue tracking that moves fast',
    category: 'Business',
  },
  {
    id: 'notion',
    name: 'Notion Workspace',
    url: 'https://notion.so',
    packageName: 'so.notion.workspace',
    iconName: 'FileText',
    iconBg: '#111827',
    iconColor: '#FFFFFF',
    themeColor: '#111827',
    splashBg: '#191919',
    tagline: 'Connected Workspace for Docs & Wiki',
    category: 'Productivity',
  },
  {
    id: 'shopify',
    name: 'Modern Shop',
    url: 'https://shopify.com',
    packageName: 'com.store.shop',
    iconName: 'ShoppingBag',
    iconBg: '#008060',
    iconColor: '#FFFFFF',
    themeColor: '#008060',
    splashBg: '#F4F6F8',
    tagline: 'Shop curated collections with 1 tap',
    category: 'Shopping',
  },
  {
    id: 'spotify',
    name: 'Spotify Player',
    url: 'https://open.spotify.com',
    packageName: 'com.spotify.musicweb',
    iconName: 'Music',
    iconBg: '#1DB954',
    iconColor: '#121212',
    themeColor: '#1DB954',
    splashBg: '#121212',
    tagline: 'Music for everyone',
    category: 'Entertainment',
  },
  {
    id: 'github',
    name: 'GitHub Hub',
    url: 'https://github.com',
    packageName: 'com.github.mobileweb',
    iconName: 'Code',
    iconBg: '#24292E',
    iconColor: '#FFFFFF',
    themeColor: '#24292E',
    splashBg: '#0D1117',
    tagline: 'Where the world builds software',
    category: 'Developer Tools',
  },
];

export const DEFAULT_APP_CONFIG: AppConfig = {
  url: 'https://example.com',
  name: 'My Web App',
  packageName: 'com.mycompany.app',
  versionName: '1.0.0',
  versionCode: 1,
  category: 'Productivity',
  description: 'Fast, native-wrapped mobile application powered by WebToAPK Studio',

  icon: {
    type: 'preset',
    presetIconName: 'Globe',
    customDataUrl: null,
    backgroundColor: '#3B82F6',
    iconColor: '#FFFFFF',
    shape: 'squircle',
    scale: 0.8,
  },

  splash: {
    enabled: true,
    backgroundColor: '#0F172A',
    textColor: '#FFFFFF',
    duration: 2,
    loaderStyle: 'spinner',
    showAppName: true,
    tagline: 'Fast & Secure Mobile Experience',
    accentColor: '#3B82F6',
  },

  ui: {
    displayMode: 'standalone',
    themeColor: '#3B82F6',
    statusBarColor: '#0F172A',
    statusBarLightIcons: true,
    navBarColor: '#0F172A',
    orientation: 'portrait',
    pullToRefresh: true,
    keepScreenAwake: false,
    enableZoom: false,
    hardwareAcceleration: true,
    showExitConfirm: true,
    openExternalInBrowser: true,
    customUserAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 WebToAPK/1.0',
    useCustomUserAgent: false,
  },

  permissions: {
    camera: false,
    location: true,
    microphone: false,
    storage: true,
    notifications: true,
    vibration: true,
    biometrics: false,
  },

  offline: {
    enabled: true,
    offlineTitle: 'No Connection',
    offlineMessage: 'Please check your internet connection and tap retry.',
    showRetryButton: true,
    offlineColor: '#EF4444',
  },

  build: {
    signApk: true,
    keystoreAlias: 'webtoapk-release',
    minSdkVersion: 24, // Android 7.0+
    targetSdkVersion: 34, // Android 14
    enableTWA: false,
  },
};
