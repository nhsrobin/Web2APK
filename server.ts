import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route: Analyze URL for auto-filling App Name, Favicon, Theme color, and Manifest
  app.post("/api/analyze-url", async (req, res) => {
    try {
      let { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      const parsedUrl = new URL(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0 WebToAPK-Bot/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
      }).catch((err) => {
        return null;
      });

      clearTimeout(timeoutId);

      const domain = parsedUrl.hostname.replace(/^www\./, "");
      const domainParts = domain.split(".").filter(Boolean);
      let suggestedPackage = "com.webapp.app";
      if (domainParts.length >= 2) {
        const tld = domainParts[domainParts.length - 1].replace(/[^a-zA-Z0-9]/g, "");
        const name = domainParts[domainParts.length - 2].replace(/[^a-zA-Z0-9]/g, "");
        suggestedPackage = `com.${name || "app"}.${tld || "web"}`;
      }

      let title = domain.charAt(0).toUpperCase() + domain.slice(1);
      let themeColor = "#3B82F6";
      let favicon = `${parsedUrl.origin}/favicon.ico`;
      let description = "";

      if (response && response.ok) {
        const html = await response.text();

        // Extract Title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim().split(/[|\-–—]/)[0].trim();
        }

        // Extract Theme Color
        const themeColorMatch = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);
        if (themeColorMatch && themeColorMatch[1]) {
          themeColor = themeColorMatch[1].trim();
        }

        // Extract Description
        const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
        if (descMatch && descMatch[1]) {
          description = descMatch[1].trim();
        }

        // Extract Apple Touch Icon or High-Res Icon
        const appleIconMatch = html.match(/<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/i) ||
                               html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon(?:-precomposed)?["']/i);
        if (appleIconMatch && appleIconMatch[1]) {
          favicon = new URL(appleIconMatch[1], url).href;
        } else {
          const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
                            html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
          if (iconMatch && iconMatch[1]) {
            favicon = new URL(iconMatch[1], url).href;
          }
        }
      }

      return res.json({
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
        error: "Failed to analyze URL",
        message: err?.message || String(err),
      });
    }
  });

  // API Route: Trigger Background Cloud Build (GitHub Actions / Google Cloud Build)
  app.post("/api/trigger-cloud-build", async (req, res) => {
    try {
      const config = req.body;
      if (!config || !config.url) {
        return res.status(400).json({ error: "Missing configuration or URL" });
      }

      const githubToken = process.env.GITHUB_BUILD_TOKEN;
      const githubRepo = process.env.GITHUB_BUILD_REPO;

      if (githubToken && githubRepo) {
        // Trigger GitHub Actions workflow dispatch via GitHub REST API
        const dispatchRes = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "WebToAPK-Studio-Backend",
          },
          body: JSON.stringify({
            event_type: "build-apk",
            client_payload: {
              appName: config.name,
              targetUrl: config.url,
              packageName: config.packageName,
              themeColor: config.ui?.themeColor || "#3B82F6",
              versionName: config.versionName || "1.0.0",
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (dispatchRes.ok) {
          return res.json({
            status: "dispatched",
            message: "Background APK compilation started on GitHub Cloud Runner",
            repo: githubRepo,
          });
        }
      }

      return res.json({
        status: "ready",
        message: "Direct client packaging ready",
      });
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to trigger cloud build",
        message: err?.message || String(err),
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
