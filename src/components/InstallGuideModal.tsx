import React from 'react';
import { X, Smartphone, ShieldCheck, Download, Settings, Play } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                How to Install Your APK on Android
              </h3>
              <p className="text-xs text-slate-400">
                Simple 3-step sideloading guide for all Android phones
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

        {/* Steps */}
        <div className="py-5 overflow-y-auto space-y-4 flex-1 text-sm text-slate-300">
          {/* Step 1 */}
          <div className="flex gap-3.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 items-start">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">
                Download the .apk File
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click <strong>"Download APK"</strong> on your phone or send the downloaded file to your device via Chrome, WhatsApp, Drive, or Telegram.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 items-start">
            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">
                Allow Unknown Apps / Sources
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                When opening the APK, Android may show a prompt saying <em>"For your security, your phone is not allowed to install unknown apps from this source."</em> Tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 items-start">
            <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">
                Tap "Install" & Launch
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tap <strong>"Install"</strong>. Within 1-2 seconds, the application will appear on your Android Home Screen and App Drawer with your customized launcher icon and splash screen!
              </p>
            </div>
          </div>

          {/* Play Protect Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <span className="font-semibold block mb-1">Google Play Protect Notice:</span>
            Because self-compiled APKs are signed with a developer test certificate, Play Protect might show "Unrecognized app". Simply tap <strong>"More Details" &gt; "Install anyway"</strong>.
          </div>

          {/* Parsing Issue Troubleshooting */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            <span className="font-semibold block mb-1">Seeing "Problem parsing the package"?</span>
            If your Android OS version rejects client-generated bundles, download the <strong>Android Studio Source (.zip)</strong> to compile directly in Android Studio, or trigger the <strong>GitHub Actions</strong> workflow to get a 100% verified release APK compiled with the official Android SDK toolchain.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
