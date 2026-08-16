import React, { useState } from 'react';
import { Globe, Wand2, CheckCircle2, AlertCircle, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { AppConfig } from '../types';
import { PRESET_APPS, PresetApp } from '../data/presets';

interface UrlInputSectionProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
  onApplyPreset: (preset: PresetApp) => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  config,
  onChange,
  onApplyPreset,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleUrlChange = (newUrl: string) => {
    onChange({ url: newUrl });
    if (analysisStatus.type !== 'idle') {
      setAnalysisStatus({ type: 'idle', message: '' });
    }
  };

  const handleAutoAnalyze = async () => {
    if (!config.url || config.url.trim() === '') {
      setAnalysisStatus({
        type: 'error',
        message: 'Please enter a valid website URL first.',
      });
      return;
    }

    setAnalyzing(true);
    setAnalysisStatus({ type: 'idle', message: '' });

    try {
      let target = config.url.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
        onChange({ url: target });
      }

      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await res.json();
      
      const updates: Partial<AppConfig> = {};
      if (data.title) updates.name = data.title;
      if (data.suggestedPackage) updates.packageName = data.suggestedPackage;
      if (data.themeColor) {
        updates.ui = {
          ...config.ui,
          themeColor: data.themeColor,
          statusBarColor: data.themeColor,
        };
        updates.splash = {
          ...config.splash,
          accentColor: data.themeColor,
        };
      }

      onChange(updates);
      setAnalysisStatus({
        type: 'success',
        message: `Detected "${data.title || data.domain}" with package "${data.suggestedPackage}".`,
      });
    } catch (err: any) {
      // Fallback domain extraction
      try {
        const u = new URL(config.url.startsWith('http') ? config.url : 'https://' + config.url);
        const domain = u.hostname.replace(/^www\./, '');
        const name = domain.split('.')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        onChange({
          name: formattedName,
          packageName: `com.${name}.app`.toLowerCase(),
        });
        setAnalysisStatus({
          type: 'success',
          message: `Auto-configured based on domain "${domain}".`,
        });
      } catch (e) {
        setAnalysisStatus({
          type: 'error',
          message: 'Could not automatically analyze this URL. You can configure manually.',
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const isHttps = config.url.startsWith('https://');

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">
              Target Website URL
            </h2>
            <p className="text-[11px] text-slate-400">
              The web app or website that will be encapsulated in your native APK
            </p>
          </div>
        </div>
        {config.url && (
          <a
            href={config.url.startsWith('http') ? config.url : `https://${config.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* URL Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            id="input-target-url"
            type="url"
            value={config.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://your-website.com"
            className="w-full pl-3 pr-9 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-blue-500 focus:ring-1.5 focus:ring-blue-500/20 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-500 outline-none transition-all"
          />
          {isHttps ? (
            <span
              title="Secure HTTPS Protocol"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span
              title="HTTP Protocol (HTTPS is recommended)"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400"
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <button
          id="btn-auto-analyze"
          type="button"
          onClick={handleAutoAnalyze}
          disabled={analyzing}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 whitespace-nowrap"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fill Info</span>
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {analysisStatus.message && (
        <div
          className={`mt-2 px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ${
            analysisStatus.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}
        >
          {analysisStatus.type === 'success' ? (
            <CheckCircle2 className="w-3 h-3 shrink-0" />
          ) : (
            <AlertCircle className="w-3 h-3 shrink-0" />
          )}
          <span>{analysisStatus.message}</span>
        </div>
      )}

      {/* Quick Preset Badges */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Preset Templates:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_APPS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: preset.themeColor }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
