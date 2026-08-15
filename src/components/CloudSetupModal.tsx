import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Layers,
  Cpu,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Flame,
  GitBranch,
} from 'lucide-react';
import { AppConfig } from '../types';

interface CloudSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
}

export const CloudSetupModal: React.FC<CloudSetupModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'firebase-github' | 'github-apk' | 'worker-api' | 'architecture'>('firebase-github');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gitPushCommands = `# 1. Initialize Git repository in this web project folder
git init
git add .
git commit -m "feat: Initial WebToAPK Studio production setup"

# 2. Add your GitHub repository URL (replace with your repo)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/web-to-apk-studio.git

# 3. Push to GitHub
git push -u origin main`;

  const firebaseInitCommands = `# 1. Install Firebase CLI globally (if not installed)
npm install -g firebase-tools

# 2. Log in to your Firebase account
firebase login

# 3. Initialize Firebase Hosting with automatic GitHub Actions deployment
firebase init hosting:github

# Follow the on-screen prompts:
# - Select your Firebase Project
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds and deploys with GitHub: Yes
# - What is the name of your GitHub repo: YOUR_USERNAME/web-to-apk-studio`;

  const githubWorkflowYml = `name: Build Native Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build & Export APKs
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Repository
        uses: actions/checkout@v4

      - name: Set up OpenJDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Make Gradle Wrapper Executable
        run: chmod +x gradlew

      - name: Compile Instant-Test Debug APK (No keystore needed)
        run: ./gradlew assembleDebug --stacktrace

      - name: Compile Production Release APK
        run: ./gradlew assembleRelease --stacktrace

      - name: Upload Debug APK Artifact (Install on any phone)
        uses: actions/upload-artifact@v4
        with:
          name: ${config.name.replace(/[^a-zA-Z0-9_\-]/g, '')}-Debug-APK
          path: app/build/outputs/apk/debug/*.apk

      - name: Upload Release APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${config.name.replace(/[^a-zA-Z0-9_\-]/g, '')}-Release-APK
          path: app/build/outputs/apk/release/*.apk
`;

  const autoDispatchApiSnippet = `// Live Auto-Trigger: How your frontend/backend triggers GitHub to build an APK
async function triggerGitHubApkBuild(appConfig) {
  const GITHUB_TOKEN = "your_github_personal_access_token";
  const REPO_OWNER = "YOUR_USERNAME";
  const REPO_NAME = "apk-compiler-runner";

  const response = await fetch(\`https://api.github.com/repos/\${REPO_OWNER}/\${REPO_NAME}/dispatches\`, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${GITHUB_TOKEN}\`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "build-apk",
      client_payload: {
        appName: appConfig.name,
        targetUrl: appConfig.url,
        packageName: appConfig.packageName,
        themeColor: appConfig.ui.themeColor
      }
    })
  });

  return response.ok; // GitHub Action spins up, compiles APK, and stores download link
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Live GitHub & Firebase Hosting Deployment Guide
              </h3>
              <p className="text-xs text-slate-400">
                Push your web app to GitHub &rarr; Host on Firebase &rarr; Automate 100% Free Background APK Builds
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('firebase-github')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'firebase-github'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Push to GitHub & Host on Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('github-apk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'github-apk'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Background APK Action Workflow</span>
          </button>

          <button
            onClick={() => setActiveTab('worker-api')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'worker-api'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Front-End Live Auto-Build API</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. Production Specs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-300 pr-1 scrollbar-thin">
          {activeTab === 'firebase-github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>How to Host This App on Firebase Hosting with Custom Domain</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Follow these simple terminal commands to push this web app to GitHub and deploy it live to Firebase Hosting with free SSL and custom domain support.
                </p>
              </div>

              {/* Step 1: Git Push */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">1</span>
                    Step 1: Push Web App to Your GitHub Repo
                  </span>
                  <button
                    onClick={() => handleCopy(gitPushCommands, 'git-push')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'git-push' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'git-push' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] overflow-x-auto text-slate-300">
                  <pre>{gitPushCommands}</pre>
                </div>
              </div>

              {/* Step 2: Firebase CLI Init */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">2</span>
                    Step 2: Connect GitHub to Firebase Hosting (Automatic CI/CD)
                  </span>
                  <button
                    onClick={() => handleCopy(firebaseInitCommands, 'fb-init')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'fb-init' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'fb-init' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] overflow-x-auto text-slate-300">
                  <pre>{firebaseInitCommands}</pre>
                </div>
              </div>

              {/* Step 3: Custom Domain */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                <span className="font-semibold block mb-1">Step 3: Connect Custom Domain in Firebase Console</span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Go to <strong>Firebase Console &gt; Hosting &gt; Add Custom Domain</strong>. Enter your domain (e.g. <code className="text-blue-300">app.yourdomain.com</code>) and add the DNS TXT/A records provided by Firebase. Free SSL is provisioned automatically within minutes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'github-apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>The Background APK Compiler Workflow (.github/workflows/build-apk.yml)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs">
                  This GitHub Actions workflow is automatically included inside the generated project. When triggered, GitHub spins up an Ubuntu runner with OpenJDK 17 and compiles a verified `.apk` in 40 seconds for free.
                </p>
              </div>

              {/* Code block */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] overflow-x-auto">
                <button
                  onClick={() => handleCopy(githubWorkflowYml, 'gh-yml')}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'gh-yml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'gh-yml' ? 'Copied' : 'Copy YAML'}</span>
                </button>
                <pre className="text-slate-300 leading-relaxed">{githubWorkflowYml}</pre>
              </div>
            </div>
          )}

          {activeTab === 'worker-api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>How the Live Frontend Triggers Background APK Compilation</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs">
                  When a customer on your live website enters a URL and clicks <strong>"Download APK"</strong>, here is how the frontend triggers background compilation:
                </p>
              </div>

              {/* Architecture Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                  <div className="font-bold text-white mb-1">1. User Clicks</div>
                  <p className="text-slate-400 text-[11px]">
                    User enters URL & custom branding, then clicks "Download APK".
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                  <div className="font-bold text-white mb-1">2. Cloud Runner Builds</div>
                  <p className="text-slate-400 text-[11px]">
                    GitHub Action or Cloud Run Worker compiles Gradle release package in background.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                  <div className="font-bold text-white mb-1">3. Direct Download</div>
                  <p className="text-slate-400 text-[11px]">
                    The APK link is passed back to frontend for 1-tap download and installation.
                  </p>
                </div>
              </div>

              {/* Code snippet */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] overflow-x-auto">
                <button
                  onClick={() => handleCopy(autoDispatchApiSnippet, 'dispatch')}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'dispatch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'dispatch' ? 'Copied' : 'Copy JS Snippet'}</span>
                </button>
                <pre className="text-slate-300 leading-relaxed">{autoDispatchApiSnippet}</pre>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl">
                  <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Clean Native Package (~2.5 MB – 6 MB)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Full AndroidX & Material 3 standalone application. It runs directly inside its own native dedicated app process—not inside Chrome tabs or external browser windows.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl">
                  <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Android 14 (API 34) Ready</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Full support for HTML5 Fullscreen Video, Camera & Gallery photo pickers, Android 13+ Granular Permissions, and Keystore v2 cryptographic signing.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Summary: Total Monthly Cost
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs">
                  <strong>Total Cost: $0.00 / month.</strong> Firebase Hosting offers a generous free tier (10 GB storage, 360 MB/day transfer), GitHub Actions offers 2,000 free build minutes every month, and custom SSL certificates are 100% free forever.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
