import React from 'react';
import { Tag, Package, Hash, Layers } from 'lucide-react';
import { AppConfig } from '../types';

interface BrandingSectionProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

const APP_CATEGORIES = [
  'Productivity',
  'Business',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Education',
  'Finance',
  'Social',
  'Health & Fitness',
  'Developer Tools',
];

export const BrandingSection: React.FC<BrandingSectionProps> = ({
  config,
  onChange,
}) => {
  const handlePackageChange = (val: string) => {
    // Sanitize package name (lowercase letters, numbers, and dots)
    const sanitized = val.toLowerCase().replace(/[^a-z0-9._]/g, '');
    onChange({ packageName: sanitized });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100 text-sm sm:text-base">
            App Identity & Package
          </h2>
          <p className="text-xs text-slate-400">
            Define your Android app title, internal identifier, and versioning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* App Name */}
        <div>
          <label
            htmlFor="input-app-name"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            App Name (Launcher Title)
          </label>
          <div className="relative">
            <input
              id="input-app-name"
              type="text"
              value={config.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. My Awesome App"
              maxLength={30}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 text-sm placeholder-slate-500 outline-none transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
              {config.name.length}/30
            </span>
          </div>
        </div>

        {/* Package Name */}
        <div>
          <label
            htmlFor="input-package-name"
            className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between"
          >
            <span>Package Name (Application ID)</span>
          </label>
          <div className="relative">
            <input
              id="input-package-name"
              type="text"
              value={config.packageName}
              onChange={(e) => handlePackageChange(e.target.value)}
              placeholder="com.company.app"
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 text-sm font-mono placeholder-slate-500 outline-none transition-all"
            />
            <Package className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Version Name & Code */}
        <div>
          <label
            htmlFor="input-version-name"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Version String (Display)
          </label>
          <input
            id="input-version-name"
            type="text"
            value={config.versionName}
            onChange={(e) => onChange({ versionName: e.target.value })}
            placeholder="1.0.0"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 text-sm font-mono placeholder-slate-500 outline-none transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="input-version-code"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Version Code (Build Int)
          </label>
          <div className="relative">
            <input
              id="input-version-code"
              type="number"
              min={1}
              value={config.versionCode}
              onChange={(e) =>
                onChange({ versionCode: Math.max(1, parseInt(e.target.value) || 1) })
              }
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 text-sm font-mono placeholder-slate-500 outline-none transition-all"
            />
            <Hash className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label
            htmlFor="select-category"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            App Category
          </label>
          <select
            id="select-category"
            value={config.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 text-sm outline-none transition-all cursor-pointer"
          >
            {APP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
