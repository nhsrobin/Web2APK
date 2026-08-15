import { AppConfig } from '../types';
import { getIconDataUrl } from './iconGenerator';

/**
 * Generates an Apple iOS .mobileconfig WebClip profile for 1-tap installation on iPhone/iPad
 */
export async function generateIosMobileConfig(config: AppConfig): Promise<Blob> {
  const iconDataUrl = await getIconDataUrl(config.icon, 192);
  const iconBase64 = iconDataUrl.replace(/^data:image\/png;base64,/, '');

  const payloadUuid = generateUuid();
  const profileUuid = generateUuid();

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${iconBase64}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${escapeXml(config.name)}</string>
            <key>PayloadDescription</key>
            <string>Installs WebClip for ${escapeXml(config.name)}</string>
            <key>PayloadDisplayName</key>
            <string>${escapeXml(config.name)} WebClip</string>
            <key>PayloadIdentifier</key>
            <string>${config.packageName}.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>${payloadUuid}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${config.url}</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Install ${escapeXml(config.name)} native full-screen app on iOS Home Screen</string>
    <key>PayloadDisplayName</key>
    <string>${escapeXml(config.name)} App</string>
    <key>PayloadIdentifier</key>
    <string>${config.packageName}</string>
    <key>PayloadOrganization</key>
    <string>${escapeXml(config.name)}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${profileUuid}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

  return new Blob([xmlContent], { type: 'application/x-apple-aspen-config' });
}

/**
 * Generates PWA Web App Manifest JSON
 */
export async function generatePwaManifest(config: AppConfig): Promise<Blob> {
  const manifest = {
    name: config.name,
    short_name: config.name,
    start_url: config.url,
    display: config.ui.displayMode === 'fullscreen' ? 'fullscreen' : 'standalone',
    background_color: config.splash.backgroundColor,
    theme_color: config.ui.themeColor,
    orientation: config.ui.orientation === 'portrait' ? 'portrait' : 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: [config.category.toLowerCase()],
  };

  return new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
