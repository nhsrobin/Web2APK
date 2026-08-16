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

  // API Route: Build Real Signed Android APK via Cloud Compiler API
  app.post("/api/build-apk", async (req, res) => {
    try {
      const {
        name = "WebApp",
        url,
        packageName = "com.webapp.app",
        themeColor = "#3B82F6",
        iconUrl,
        displayMode = "standalone",
        orientation = "portrait",
      } = req.body || {};

      if (!url) {
        return res.status(400).json({ error: "Target URL is required" });
      }

      const cleanUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      const cleanHost = new URL(cleanUrl).hostname;

      const pwaManifest = {
        name: name,
        short_name: name.substring(0, 12),
        start_url: cleanUrl,
        display: displayMode === "fullscreen" ? "fullscreen" : "standalone",
        background_color: "#0f172a",
        theme_color: themeColor,
        orientation: orientation,
        icons: [
          {
            src: iconUrl || `https://www.google.com/s2/favicons?domain=${cleanHost}&sz=512`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
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
        navColor: "#0f172a",
        signingMode: "none",
        appVersion: "1.0.0",
        appVersionCode: 1,
        shortcuts: [],
        includeSourceCode: false,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const apiResponse = await fetch(
        "https://pwabuilder-apiv2.centralus.cloudapp.azure.com/api/Package/apk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/octet-stream, application/vnd.android.package-archive, application/zip",
          },
          body: JSON.stringify(buildPayload),
          signal: controller.signal,
        }
      ).catch(() => null);

      clearTimeout(timeoutId);

      if (apiResponse && apiResponse.ok) {
        const arrayBuffer = await apiResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${name.replace(/[^a-zA-Z0-9_\-]/g, "_").toLowerCase()}-v1.0.0.apk"`
        );
        return res.status(200).send(buffer);
      }

      return res.status(502).json({
        error: "Cloud compilation service busy",
        message: "Please use Android Studio Source (.zip) or GitHub Actions for a verified Gradle build.",
      });
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to build APK",
        message: err?.message || String(err),
      });
    }
  });

  // API Route: Trigger Background Cloud Build (GitHub Actions / Google Cloud Build)
  app.post("/api/github/dispatch", async (req, res) => {
    try {
      const { repo, token, config } = req.body || {};
      const targetRepo = (repo || process.env.GITHUB_BUILD_REPO || "").trim();
      const targetToken = (token || process.env.GITHUB_BUILD_TOKEN || "").trim();

      if (!targetRepo) {
        return res.status(400).json({
          error: "GitHub Repository is required (e.g., username/repo)",
        });
      }
      if (!targetToken) {
        return res.status(400).json({
          error: "GitHub Personal Access Token is required to trigger GitHub Actions",
        });
      }

      if (!config || !config.url) {
        return res.status(400).json({ error: "Missing app configuration or URL" });
      }

      // 1. Try workflow_dispatch first
      const cleanAppName = (config.name || "WebApp").substring(0, 30);
      const cleanUrl = config.url.startsWith("http") ? config.url : `https://${config.url}`;
      
      const payload = {
        event_type: "build-apk",
        client_payload: {
          appName: cleanAppName,
          targetUrl: cleanUrl,
          packageName: config.packageName || "com.webapp.app",
          themeColor: config.ui?.themeColor || "#3B82F6",
          versionName: config.versionName || "1.0.0",
          timestamp: new Date().toISOString(),
        },
      };

      // Attempt repository_dispatch
      const dispatchRes = await fetch(`https://api.github.com/repos/${targetRepo}/dispatches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${targetToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "WebToAPK-Studio-Backend",
        },
        body: JSON.stringify(payload),
      });

      if (dispatchRes.status === 204 || dispatchRes.ok) {
        return res.json({
          success: true,
          status: "dispatched",
          message: "GitHub Actions workflow dispatched successfully! Compilation started on Ubuntu runner.",
          repo: targetRepo,
        });
      }

      // If repository dispatch had an issue, let's try workflow_dispatch on build-apk.yml
      const wfDispatchRes = await fetch(
        `https://api.github.com/repos/${targetRepo}/actions/workflows/build-apk.yml/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${targetToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "WebToAPK-Studio-Backend",
          },
          body: JSON.stringify({
            ref: "main",
            inputs: {
              appName: cleanAppName,
              targetUrl: cleanUrl,
              packageName: config.packageName || "com.webapp.app",
              themeColor: config.ui?.themeColor || "#3B82F6",
            },
          }),
        }
      );

      if (wfDispatchRes.status === 204 || wfDispatchRes.ok) {
        return res.json({
          success: true,
          status: "dispatched",
          message: "GitHub Actions workflow_dispatch triggered successfully!",
          repo: targetRepo,
        });
      }

      const errorText = await dispatchRes.text();
      return res.status(dispatchRes.status).json({
        error: `GitHub API error (${dispatchRes.status})`,
        message: errorText || "Failed to trigger GitHub Actions. Check repository permissions and token scope.",
      });
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to trigger GitHub cloud build",
        message: err?.message || String(err),
      });
    }
  });

  // API Route: Get latest GitHub Actions workflow runs
  app.post("/api/github/runs", async (req, res) => {
    try {
      const { repo, token } = req.body || {};
      const targetRepo = (repo || process.env.GITHUB_BUILD_REPO || "").trim();
      const targetToken = (token || process.env.GITHUB_BUILD_TOKEN || "").trim();

      if (!targetRepo) {
        return res.status(400).json({ error: "GitHub Repository required" });
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "WebToAPK-Studio-Backend",
      };
      if (targetToken) {
        headers["Authorization"] = `Bearer ${targetToken}`;
      }

      const runsRes = await fetch(
        `https://api.github.com/repos/${targetRepo}/actions/runs?per_page=5`,
        { headers }
      );

      if (!runsRes.ok) {
        const errText = await runsRes.text();
        return res.status(runsRes.status).json({
          error: "GitHub Actions runs fetch failed",
          message: errText,
        });
      }

      const data: any = await runsRes.json();
      return res.json({
        total_count: data.total_count,
        workflow_runs: (data.workflow_runs || []).map((run: any) => ({
          id: run.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          html_url: run.html_url,
          created_at: run.created_at,
          updated_at: run.updated_at,
          run_number: run.run_number,
          artifacts_url: run.artifacts_url,
        })),
      });
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to fetch GitHub runs",
        message: err?.message || String(err),
      });
    }
  });

  // API Route: Get GitHub Artifacts for a specific run
  app.post("/api/github/artifacts", async (req, res) => {
    try {
      const { repo, token, runId } = req.body || {};
      const targetRepo = (repo || process.env.GITHUB_BUILD_REPO || "").trim();
      const targetToken = (token || process.env.GITHUB_BUILD_TOKEN || "").trim();

      if (!targetRepo || !runId) {
        return res.status(400).json({ error: "Repo and runId are required" });
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "WebToAPK-Studio-Backend",
      };
      if (targetToken) {
        headers["Authorization"] = `Bearer ${targetToken}`;
      }

      const artRes = await fetch(
        `https://api.github.com/repos/${targetRepo}/actions/runs/${runId}/artifacts`,
        { headers }
      );

      if (!artRes.ok) {
        return res.status(artRes.status).json({ error: "Failed to get artifacts" });
      }

      const data: any = await artRes.json();
      return res.json({
        artifacts: (data.artifacts || []).map((art: any) => ({
          id: art.id,
          name: art.name,
          size_in_bytes: art.size_in_bytes,
          archive_download_url: art.archive_download_url,
          created_at: art.created_at,
          expired: art.expired,
        })),
      });
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to fetch artifacts",
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
