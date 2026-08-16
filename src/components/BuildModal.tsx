import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import QRCode from 'qrcode';
import { AppConfig, BuildLog } from '../types';
import {
  buildApkPackage,
  buildAndroidStudioProjectZip,
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
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isBuilding, setIsBuilding] = useState<boolean>(true);
  const [buildSuccess, setBuildSuccess] = useState<boolean>(false);
  const [apkBlob, setApkBlob] = useState<Blob | null>(null);
  const [apkFileName, setApkFileName] = useState<string>('');
  const [apkSizeBytes, setApkSizeBytes] = useState<number>(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger Build when opened
  useEffect(() => {
    if (isOpen) {
      startBuild();
    }
  }, [isOpen]);

  const startBuild = async () => {
    setIsBuilding(true);
    setBuildSuccess(false);
    setLogs([]);
    setProgress(0);
    setApkBlob(null);

    try {
      // Trigger background cloud build worker
      fetch('/api/trigger-cloud-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).catch((e) => console.log('Cloud trigger background notice:', e));

      const result = await buildApkPackage(config, (log) => {
        setLogs((prev) => [...prev, log]);
        setProgress(log.progress);
      });

      setApkBlob(result.blob);
      setApkFileName(result.fileName);
      setApkSizeBytes(result.sizeBytes);
      setBuildSuccess(true);
      setIsBuilding(false);

      // Generate QR Code containing the target app URL or simulated download
      const qrTarget = config.url.startsWith('http') ? config.url : `https://${config.url}`;
      const qrData = await QRCode.toDataURL(qrTarget, {
        width: 256,
        margin: 1.5,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(qrData);
    } catch (err: any) {
      console.error('Build error:', err);
      setIsBuilding(false);
      setBuildSuccess(false);
      setLogs((prev) => [
        ...prev,
        {
          id: 'err',
          timestamp: new Date().toLocaleTimeString(),
          stage: 'error',
          message: `Build failed: ${err?.message || 'Unknown error during packaging'}`,
          progress: 100,
        },
      ]);
    }
  };

  const handleDownloadApk = () => {
    if (!apkBlob) return;
    const url = URL.createObjectURL(apkBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = apkFileName || `${config.name.toLowerCase()}-app.apk`;
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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(config.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isBuilding ? 'Building APK Package' : 'Your APK is Ready!'}
              </h3>
              <p className="text-xs text-slate-400">
                {config.name} • {config.packageName} (v{config.versionName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 overflow-y-auto space-y-6 flex-1 pr-1">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Packaging Progress</span>
              <span className="text-blue-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Build Terminal / Logs */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span
                  className={
                    log.stage === 'done'
                      ? 'text-emerald-400 font-semibold'
                      : log.stage === 'error'
                      ? 'text-red-400 font-semibold'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
            {isBuilding && (
              <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Running compilation toolchain...</span>
              </div>
            )}
          </div>

          {/* Completed State Actions */}
          {buildSuccess && (
            <div className="space-y-5 animate-fade-in">
              {/* Primary APK Download Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/30">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {apkFileName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 justify-center sm:justify-start">
                      <span className="text-xs text-emerald-400 font-semibold">
                        Ready to Install
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {apkSizeBytes > 1024 * 1024
                          ? `${(apkSizeBytes / (1024 * 1024)).toFixed(2)} MB`
                          : `${(apkSizeBytes / 1024).toFixed(1)} KB`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-download-apk-modal"
                  onClick={handleDownloadApk}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK</span>
                </button>
              </div>

              {/* QR Code Scan & Alternative Formats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Code Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    <span>Scan with Mobile Camera</span>
                  </span>
                  {qrCodeDataUrl ? (
                    <div className="p-2 bg-white rounded-xl shadow-md my-1">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-slate-800 rounded-xl animate-pulse" />
                  )}
                  <button
                    onClick={handleCopyUrl}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 mt-2 transition-colors"
                  >
                    {copiedLink ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedLink ? 'Copied URL!' : 'Copy Target Link'}</span>
                  </button>
                </div>

                {/* Additional Package Exports */}
                <div className="flex flex-col justify-between gap-2.5">
                  <button
                    onClick={handleDownloadAndroidStudioZip}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          Android Studio Source (.zip)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Complete Kotlin & Gradle project
                        </span>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>

                  <button
                    onClick={handleDownloadIosConfig}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Apple className="w-4 h-4 text-slate-200" />
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          iOS WebClip (.mobileconfig)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Install 1-tap web app on iPhone
                        </span>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 transition-colors" />
                  </button>

                  <button
                    onClick={handleDownloadPwaManifest}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          PWA Web Manifest (.json)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          manifest.json for Web Browsers
                        </span>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <button
            onClick={onOpenGuide}
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>How do I install this APK on my phone?</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex gap-2">
            {!isBuilding && (
              <button
                onClick={startBuild}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rebuild</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
