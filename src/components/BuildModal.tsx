import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Smartphone,
  QrCode,
  Layers,
  Sparkles,
  Apple,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
  GitBranch,
  Play,
  Terminal,
  Shield,
  Clock,
  HardDrive,
  Info,
} from 'lucide-react';
import QRCode from 'qrcode';
import { AppConfig, BuildLog } from '../types';
import {
  buildApkPackage,
  buildAndroidStudioProjectZip,
  generateGitHubWorkflowYml,
} from '../lib/apkGenerator';
import {
  generateIosMobileConfig,
  generatePwaManifest,
} from '../lib/mobileConfigGenerator';

interface BuildModalProps {
  isOpen: boolean;
  config: AppConfig;
  onClose: () => void;
  onOpenGuide: () => void;
}

export const BuildModal: React.FC<BuildModalProps> = ({
  isOpen,
  config,
  onClose,
  onOpenGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'studio' | 'quick' | 'ios'>('github');
  
  // GitHub Cloud Build state
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    return localStorage.getItem('webtoapk_gh_repo') || 'nhsrobin/Web2APK';
  });
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('webtoapk_gh_token') || '';
  });
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [githubStatus, setGithubStatus] = useState<string>('');
  const [githubError, setGithubError] = useState<string | null>(null);
  const [latestRuns, setLatestRuns] = useState<any[]>([]);
  const [activeRunArtifacts, setActiveRunArtifacts] = useState<any[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const pollingTimerRef = useRef<any>(null);

  // Quick Client Build State
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isBuildingQuick, setIsBuildingQuick] = useState<boolean>(false);
  const [quickApkBlob, setQuickApkBlob] = useState<Blob | null>(null);
  const [quickApkFileName, setQuickApkFileName] = useState<string>('');
  const [quickApkSizeBytes, setQuickApkSizeBytes] = useState<number>(0);
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Save GitHub credentials in localStorage
  useEffect(() => {
    if (githubRepo) localStorage.setItem('webtoapk_gh_repo', githubRepo);
  }, [githubRepo]);

  useEffect(() => {
    if (githubToken) localStorage.setItem('webtoapk_gh_token', githubToken);
  }, [githubToken]);

  // Generate QR code for app target URL
  useEffect(() => {
    if (isOpen) {
      const qrTarget = config.url.startsWith('http') ? config.url : `https://${config.url}`;
      QRCode.toDataURL(qrTarget, {
        width: 256,
        margin: 1.5,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      }).then(setQrCodeDataUrl);

      // Check for any previous GitHub runs
      if (githubRepo) {
        fetchGitHubRuns();
      }
    }
  }, [isOpen, config.url]);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchGitHubRuns = async () => {
    if (!githubRepo) return;
    try {
      const res = await fetch('/api/github/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: githubRepo, token: githubToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestRuns(data.workflow_runs || []);
        
        // If there's a completed run, fetch its artifacts
        const firstRun = (data.workflow_runs || [])[0];
        if (firstRun && firstRun.status === 'completed' && firstRun.conclusion === 'success') {
          fetchArtifacts(firstRun.id);
        }
      }
    } catch (e) {
      console.log('Error fetching runs:', e);
    }
  };

  const fetchArtifacts = async (runId: number) => {
    try {
      const res = await fetch('/api/github/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: githubRepo, token: githubToken, runId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRunArtifacts(data.artifacts || []);
      }
    } catch (e) {
      console.log('Artifacts fetch error:', e);
    }
  };

  const handleTriggerGitHubBuild = async () => {
    if (!githubRepo) {
      setGithubError('Please enter your GitHub repository (e.g. username/Web2APK)');
      return;
    }

    setIsDispatching(true);
    setGithubError(null);
    setGithubStatus('Dispatching GitHub Actions workflow to Ubuntu cloud runner...');

    try {
      const res = await fetch('/api/github/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: githubRepo,
          token: githubToken,
          config,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to dispatch workflow');
      }

      setGithubStatus('Build dispatched! Ubuntu runner is booting Gradle compiler...');
      setIsPolling(true);

      // Poll runs every 4 seconds
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      
      let attempts = 0;
      pollingTimerRef.current = setInterval(async () => {
        attempts++;
        await fetchGitHubRuns();

        if (attempts >= 45) { // 3 minutes timeout
          clearInterval(pollingTimerRef.current);
          setIsPolling(false);
        }
      }, 4000);

    } catch (err: any) {
      setGithubError(err?.message || 'Failed to start GitHub build');
      setGithubStatus('');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleStartQuickBuild = async () => {
    setIsBuildingQuick(true);
    setLogs([]);
    setProgress(0);
    setQuickApkBlob(null);

    try {
      const result = await buildApkPackage(config, (log) => {
        setLogs((prev) => [...prev, log]);
        setProgress(log.progress);
      });

      setQuickApkBlob(result.blob);
      setQuickApkFileName(result.fileName);
      setQuickApkSizeBytes(result.sizeBytes);
      setIsBuildingQuick(false);
    } catch (err: any) {
      setIsBuildingQuick(false);
      setLogs((prev) => [
        ...prev,
        {
          id: 'err',
          timestamp: new Date().toLocaleTimeString(),
          stage: 'error',
          message: `Packaging failed: ${err?.message || 'Unknown error'}`,
          progress: 100,
        },
      ]);
    }
  };

  const handleDownloadQuickApk = () => {
    if (!quickApkBlob) return;
    const url = URL.createObjectURL(quickApkBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = quickApkFileName || `${config.name.toLowerCase()}-app.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAndroidStudioZip = async () => {
    const project = await buildAndroidStudioProjectZip(config);
    const url = URL.createObjectURL(project.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = project.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWorkflowYml = () => {
    const yml = generateGitHubWorkflowYml(config);
    const blob = new Blob([yml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIosConfig = async () => {
    const iosBlob = await generateIosMobileConfig(config);
    const url = URL.createObjectURL(iosBlob);
    const a = document.createElement('a');
    a.href = url;
    const sanitized = config.name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase() || 'app';
    a.download = `${sanitized}.mobileconfig`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPwaManifest = async () => {
    const pwaBlob = await generatePwaManifest(config);
    const url = URL.createObjectURL(pwaBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const latestRun = latestRuns[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Android Native APK Compiler</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  15-20 MB Full Android SDK
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {config.name} • {config.packageName} (v{config.versionName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none gap-1 shrink-0 pt-2 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Actions (15-20 MB APK)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Studio Source (.ZIP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-slate-300" />
            <span>iOS WebClip & PWA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              if (!quickApkBlob && !isBuildingQuick) handleStartQuickBuild();
            }}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Test Package</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-3 overflow-y-auto space-y-3.5 flex-1 pr-1">
          {/* TAB 1: GITHUB ACTIONS CLOUD COMPILER */}
          {activeTab === 'github' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">How GitHub Actions Builds the Full APK:</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    GitHub Actions spins up an official Ubuntu runner with Android SDK 34, executes <code className="text-cyan-300">./gradlew assembleRelease</code>, and compiles the real, genuine <strong>15-20 MB APK</strong> with Dalvik bytecode and native WebView wrapper.
                  </p>
                </div>
              </div>

              {/* GitHub Credentials Input Card */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      GitHub Repository (owner/repo)
                    </label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="e.g. nhsrobin/Web2APK"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      GitHub Personal Access Token (PAT)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx (repo & workflow scope)"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerGitHubBuild}
                      disabled={isDispatching}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isDispatching ? 'Dispatching...' : 'Start Cloud Compilation (APK)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={fetchGitHubRuns}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Check Status</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadWorkflowYml}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .github/workflows/build-apk.yml</span>
                  </button>
                </div>
              </div>

              {/* Status or Error Banner */}
              {githubError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-red-200">Dispatch Notice: </span>
                    <span>{githubError}</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Ensure your GitHub repo has the <code className="text-cyan-300">.github/workflows/build-apk.yml</code> file pushed and your token has <code className="text-cyan-300">workflow</code> / <code className="text-cyan-300">repo</code> permissions.
                    </p>
                  </div>
                </div>
              )}

              {githubStatus && (
                <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>{githubStatus}</span>
                </div>
              )}

              {/* Live GitHub Runs & Artifacts */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>GitHub Actions Workflow Runs & Artifacts</span>
                  </span>
                  {isPolling && (
                    <span className="text-[10px] text-blue-400 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Live Syncing...</span>
                    </span>
                  )}
                </div>

                {latestRuns.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    No active runs detected yet on {githubRepo}. Click &quot;Start Cloud Compilation&quot; above to launch the Gradle runner.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {latestRuns.slice(0, 3).map((run: any) => (
                      <div
                        key={run.id}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              run.status === 'completed'
                                ? run.conclusion === 'success'
                                  ? 'bg-emerald-400'
                                  : 'bg-red-400'
                                : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          <div>
                            <span className="font-semibold text-slate-100">
                              Run #{run.run_number}: {run.name || 'Build Native Android APK'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Status: {run.status} {run.conclusion ? `(${run.conclusion})` : ''} • {new Date(run.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={run.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-all flex items-center gap-1"
                          >
                            <span>View Runner Logs</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    ))}

                    {/* Downloadable Artifacts List */}
                    {activeRunArtifacts.length > 0 && (
                      <div className="mt-2 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                        <span className="text-[11px] font-bold text-emerald-300 block mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Compiled Native Android Artifacts (15-20 MB)</span>
                        </span>
                        <div className="space-y-1.5">
                          {activeRunArtifacts.map((art: any) => (
                            <div
                              key={art.id}
                              className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-emerald-400" />
                                <div>
                                  <span className="font-semibold text-white">{art.name}.zip</span>
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    {(art.size_in_bytes / (1024 * 1024)).toFixed(1)} MB • Contains installable .apk
                                  </span>
                                </div>
                              </div>

                              <a
                                href={art.archive_download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow transition-all flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download APK ZIP</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID STUDIO SOURCE PROJECT ZIP */}
          {activeTab === 'studio' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      {config.name} Android Studio Kotlin Project
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Includes MainActivity.kt, Gradle 8.2, AndroidX WebView wrapper, mipmap icons & splash layouts
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAndroidStudioZip}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ZIP</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <span className="font-semibold text-slate-200 block">How to build directly on your computer:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Unzip the downloaded project folder.</li>
                  <li>Open the folder in Android Studio (or run <code className="text-cyan-300">./gradlew assembleRelease</code> in terminal).</li>
                  <li>Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
                  <li>Android Studio compiles the 15-20 MB signed release APK ready for your phone!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: IOS WEBCLIP & PWA */}
          {activeTab === 'ios' && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Apple className="w-4 h-4 text-white" />
                      <span className="font-semibold text-xs text-white">Apple iOS WebClip</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Installs a standalone app icon on iPhone & iPad with native splash screen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadIosConfig}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .mobileconfig</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-xs text-white">PWA Web Manifest</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standard manifest.json with maskable icons and standalone theme properties.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPwaManifest}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download manifest.json</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK CLIENT PACKAGE */}
          {activeTab === 'quick' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <span>Note: This is a lightweight instant client preview package. For the official 15-20 MB signed Android package with full Dalvik bytecode, please use the <strong>GitHub Actions</strong> or <strong>Android Studio (.ZIP)</strong> tab.</span>
              </div>

              {quickApkBlob && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-slate-900 border border-blue-500/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-white text-xs block">{quickApkFileName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(quickApkSizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadQuickApk}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Package</span>
                  </button>
                </div>
              )}

              {/* Progress and Logs */}
              {isBuildingQuick && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] max-h-28 overflow-y-auto space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="text-slate-300">
                        [{log.timestamp}] {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>Android Sideloading & Installation Guide</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
