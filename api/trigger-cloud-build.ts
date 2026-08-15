export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = req.body;
    if (!config || !config.url) {
      return res.status(400).json({ error: 'Missing configuration or URL' });
    }

    const githubToken = process.env.GITHUB_BUILD_TOKEN;
    const githubRepo = process.env.GITHUB_BUILD_REPO || 'nhsrobin/Web2APK';

    if (githubToken && githubRepo) {
      const dispatchRes = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'WebToAPK-Studio-Vercel',
        },
        body: JSON.stringify({
          event_type: 'build-apk',
          client_payload: {
            appName: config.name,
            targetUrl: config.url,
            packageName: config.packageName,
            themeColor: config.ui?.themeColor || '#3B82F6',
            versionName: config.versionName || '1.0.0',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (dispatchRes.ok) {
        return res.status(200).json({
          status: 'dispatched',
          message: 'Background APK compilation started on GitHub Cloud Runner',
          repo: githubRepo,
        });
      }
    }

    return res.status(200).json({
      status: 'ready',
      message: 'Direct client packaging ready',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to trigger cloud build',
      message: err?.message || String(err),
    });
  }
}
