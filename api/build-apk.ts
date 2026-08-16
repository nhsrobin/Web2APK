export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name = 'WebApp',
      url,
      packageName = 'com.webapp.app',
      themeColor = '#3B82F6',
      iconUrl,
      displayMode = 'standalone',
      orientation = 'portrait',
    } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    const cleanUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const cleanHost = new URL(cleanUrl).hostname;

    // Microsoft PWABuilder Android Cloud API payload
    const pwaManifest = {
      name: name,
      short_name: name.substring(0, 12),
      start_url: cleanUrl,
      display: displayMode === 'fullscreen' ? 'fullscreen' : 'standalone',
      background_color: '#0f172a',
      theme_color: themeColor,
      orientation: orientation,
      icons: [
        {
          src: iconUrl || `https://www.google.com/s2/favicons?domain=${cleanHost}&sz=512`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const buildPayload = {
      manifest: pwaManifest,
      manifestUrl: cleanUrl,
      packageId: packageName,
      name: name,
      launcherName: name.substring(0, 12),
      themeColor: themeColor,
      navColor: '#0f172a',
      signingMode: 'none',
      appVersion: '1.0.0',
      appVersionCode: 1,
      shortcuts: [],
      includeSourceCode: false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const apiResponse = await fetch(
      'https://pwabuilder-apiv2.centralus.cloudapp.azure.com/api/Package/apk',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/octet-stream, application/vnd.android.package-archive, application/zip',
        },
        body: JSON.stringify(buildPayload),
        signal: controller.signal,
      }
    ).catch(() => null);

    clearTimeout(timeoutId);

    if (apiResponse && apiResponse.ok) {
      const arrayBuffer = await apiResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase()}-v1.0.0.apk"`
      );
      return res.status(200).send(buffer);
    }

    return res.status(502).json({
      error: 'Cloud compilation service temporarily busy',
      message: 'Please use the Android Studio Source (.zip) or GitHub Actions for a 100% verified Gradle release build.',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to build APK',
      message: err?.message || String(err),
    });
  }
}
