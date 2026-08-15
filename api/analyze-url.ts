export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const parsedUrl = new URL(url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0 WebToAPK-Bot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    const domain = parsedUrl.hostname.replace(/^www\./, '');
    const domainParts = domain.split('.').filter(Boolean);
    let suggestedPackage = 'com.webapp.app';
    if (domainParts.length >= 2) {
      const tld = domainParts[domainParts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const name = domainParts[domainParts.length - 2].replace(/[^a-zA-Z0-9]/g, '');
      suggestedPackage = `com.${name || 'app'}.${tld || 'web'}`;
    }

    let title = domain.charAt(0).toUpperCase() + domain.slice(1);
    let themeColor = '#3B82F6';
    let favicon = `${parsedUrl.origin}/favicon.ico`;
    let description = '';

    if (response && response.ok) {
      const html = await response.text();

      // Extract Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim().split(/[|\-–—]/)[0].trim();
      }

      // Extract Theme Color
      const themeColorMatch =
        html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);
      if (themeColorMatch && themeColorMatch[1]) {
        themeColor = themeColorMatch[1].trim();
      }

      // Extract Description
      const descMatch =
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      }

      // Extract Apple Touch Icon or High-Res Icon
      const appleIconMatch =
        html.match(/<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/i) ||
        html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon(?:-precomposed)?["']/i);
      if (appleIconMatch && appleIconMatch[1]) {
        favicon = new URL(appleIconMatch[1], url).href;
      } else {
        const iconMatch =
          html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
          html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
        if (iconMatch && iconMatch[1]) {
          favicon = new URL(iconMatch[1], url).href;
        }
      }
    }

    return res.status(200).json({
      url,
      title: title || domain,
      suggestedPackage: suggestedPackage.toLowerCase(),
      themeColor,
      favicon,
      description,
      domain,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to analyze URL',
      message: err?.message || String(err),
    });
  }
}
