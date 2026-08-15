import React, { useRef, useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Globe,
  Bot,
  ShoppingBag,
  Music,
  Code,
  FileText,
  Zap,
  Compass,
  Heart,
  Shield,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';
import { AppConfig, IconShape } from '../types';
import { renderIconToCanvas } from '../lib/iconGenerator';

interface IconSectionProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

const PRESET_ICONS = [
  { name: 'Globe', icon: Globe },
  { name: 'Bot', icon: Bot },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Music', icon: Music },
  { name: 'Code', icon: Code },
  { name: 'FileText', icon: FileText },
  { name: 'Zap', icon: Zap },
  { name: 'Compass', icon: Compass },
  { name: 'Heart', icon: Heart },
  { name: 'Shield', icon: Shield },
];

const SHAPES: { id: IconShape; label: string; roundedClass: string }[] = [
  { id: 'squircle', label: 'Squircle', roundedClass: 'rounded-2xl' },
  { id: 'circle', label: 'Circle', roundedClass: 'rounded-full' },
  { id: 'rounded', label: 'Rounded', roundedClass: 'rounded-xl' },
  { id: 'teardrop', label: 'Teardrop', roundedClass: 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl' },
  { id: 'square', label: 'Square', roundedClass: 'rounded-none' },
];

const QUICK_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#0F172A', // Dark Slate
  '#008060', // Shopify Green
  '#1DB954', // Spotify Green
  '#5E6AD2', // Linear Violet
];

export const IconSection: React.FC<IconSectionProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    renderIconToCanvas(config.icon, 256, true).then((canvas) => {
      if (active) {
        setPreviewUrl(canvas.toDataURL('image/png'));
      }
    });
    return () => {
      active = false;
    };
  }, [config.icon]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        icon: {
          ...config.icon,
          type: 'custom',
          customDataUrl: dataUrl,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomImage = () => {
    onChange({
      icon: {
        ...config.icon,
        type: 'preset',
        customDataUrl: null,
      },
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100 text-sm sm:text-base">
            App Launcher Icon Studio
          </h2>
          <p className="text-xs text-slate-400">
            Design launcher icons with adaptive shapes & multi-density mipmaps
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left: Live Icon Preview */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 border border-slate-800 rounded-2xl w-full md:w-48 shrink-0">
          <span className="text-[11px] font-medium text-slate-400 mb-2.5">
            Launcher Preview
          </span>
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="App Icon Preview"
                className="w-24 h-24 shadow-2xl transition-transform transform group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-800 animate-pulse" />
            )}
            <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-blue-500/90 text-white text-[9px] font-mono shadow-sm">
              512px
            </div>
          </div>
          <span className="text-xs text-slate-300 font-semibold mt-3 truncate max-w-[120px]">
            {config.name || 'App Icon'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            mipmap-xxxhdpi
          </span>
        </div>

        {/* Right: Icon Controls */}
        <div className="flex-1 w-full space-y-4">
          {/* Custom Upload or Preset toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Icon Graphic Source
              </label>
              {config.icon.customDataUrl && (
                <button
                  type="button"
                  onClick={handleClearCustomImage}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Use Preset Glyphs</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-icon"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  config.icon.customDataUrl
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-700/70 text-slate-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>
                  {config.icon.customDataUrl
                    ? 'Custom Image Loaded'
                    : 'Upload PNG / SVG / JPG'}
                </span>
              </button>
            </div>
          </div>

          {/* Preset Glyphs (shown when no custom image) */}
          {!config.icon.customDataUrl && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Choose Vector Glyph
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                {PRESET_ICONS.map(({ name, icon: IconComp }) => {
                  const isSelected =
                    config.icon.presetIconName.toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        onChange({
                          icon: {
                            ...config.icon,
                            presetIconName: name,
                          },
                        })
                      }
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={name}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Adaptive Shape Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Android Adaptive Icon Shape
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {SHAPES.map((shape) => {
                const isSelected = config.icon.shape === shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        icon: { ...config.icon, shape: shape.id },
                      })
                    }
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 border border-current ${shape.roundedClass}`}
                    />
                    <span>{shape.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors & Scale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.icon.backgroundColor}
                  onChange={(e) =>
                    onChange({
                      icon: { ...config.icon, backgroundColor: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={config.icon.backgroundColor}
                  onChange={(e) =>
                    onChange({
                      icon: { ...config.icon, backgroundColor: e.target.value },
                    })
                  }
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              {/* Quick Palette */}
              <div className="flex gap-1.5 mt-2">
                {QUICK_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      onChange({
                        icon: { ...config.icon, backgroundColor: color },
                      })
                    }
                    className="w-5 h-5 rounded-md border border-white/20 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Icon Scale / Padding
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  {Math.round(config.icon.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={config.icon.scale}
                onChange={(e) =>
                  onChange({
                    icon: {
                      ...config.icon,
                      scale: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg mt-2.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
