import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Smartphone,
  Monitor,
  CheckCircle2,
  Sparkles,
  Share,
  PlusSquare,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setPlatform('ios');
    } else if (/android/i.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if running standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    } else {
      // If browser doesn't support or already prompted, trigger app logo download
      downloadAppLogo();
    }
  };

  const downloadAppLogo = () => {
    const link = document.createElement('a');
    link.href = '/icon.svg';
    link.download = 'spendly-app-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* App Logo Presentation */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-md group-hover:opacity-60 transition" />
                <img
                  src="/icon.svg"
                  alt="Spendly App Logo"
                  className="relative h-24 w-24 rounded-3xl shadow-xl border border-emerald-500/30 object-contain bg-slate-950 p-1 transition-transform group-hover:scale-105"
                />
                <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md">
                  <Sparkles className="h-4 w-4 fill-current" />
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
                Download & Install Spendly
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Get lightning-fast access right from your home screen or desktop with offline tracking & cloud sync.
              </p>
            </div>

            {/* Success State or Action Options */}
            {installSuccess ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <h3 className="mt-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Spendly Installed Successfully!
                </h3>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Check your home screen or application menu to launch Spendly anytime.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {/* 1-Click Install Button */}
                <button
                  type="button"
                  id="install-app-modal-btn"
                  onClick={handleInstallClick}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
                >
                  <Download className="h-4 w-4 stroke-[2.5]" />
                  <span>{deferredPrompt ? 'Install App to Device' : 'Download Spendly App'}</span>
                </button>

                {/* Download Logo file button */}
                <button
                  type="button"
                  onClick={downloadAppLogo}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Save Official App Logo (.SVG)</span>
                </button>

                {/* Platform Specific Quick Steps */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-left text-xs dark:border-slate-800/80 dark:bg-slate-800/40">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                    {platform === 'ios' ? (
                      <>
                        <Smartphone className="h-4 w-4 text-emerald-500" />
                        <span>iOS / Safari Installation Steps</span>
                      </>
                    ) : platform === 'android' ? (
                      <>
                        <Smartphone className="h-4 w-4 text-emerald-500" />
                        <span>Android Installation Steps</span>
                      </>
                    ) : (
                      <>
                        <Monitor className="h-4 w-4 text-emerald-500" />
                        <span>Desktop Browser Installation</span>
                      </>
                    )}
                  </div>

                  {platform === 'ios' ? (
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Tap the <strong>Share</strong> button <Share className="inline h-3 w-3 mx-0.5" /> in Safari</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline h-3 w-3 mx-0.5" /></li>
                      <li>Tap <strong>Add</strong> at top right to launch Spendly</li>
                    </ol>
                  ) : platform === 'android' ? (
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Tap the menu (⋮) in Chrome</li>
                      <li>Select <strong>Install App</strong> or <strong>Add to Home screen</strong></li>
                      <li>Confirm to pin Spendly with its official logo</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Click the <strong>Install</strong> icon in your browser address bar</li>
                      <li>Or select browser menu (⋮) &gt; <strong>Install Spendly</strong></li>
                      <li>Enjoy dedicated full-screen desktop performance</li>
                    </ol>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Offline Ready • Real-Time Cloud Sync • Zero Ads</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
