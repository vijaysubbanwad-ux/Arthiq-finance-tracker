import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Lock,
  Phone,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { PhoneConfirmationResult, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'United States (+1)' },
  { code: '+44', country: 'GB', label: 'United Kingdom (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+1', country: 'CA', label: 'Canada (+1)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const {
    user,
    signInWithGoogle,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    error: authError,
    clearError,
  } = useAuth();

  // Mode state: 'initial' | 'otp'
  const [step, setStep] = useState<'phone_entry' | 'otp_entry'>('phone_entry');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isDemoOtpNotice, setIsDemoOtpNotice] = useState(false);

  const confirmationResultRef = useRef<ConfirmationResult | PhoneConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Close modal when logged in
  useEffect(() => {
    if (user && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [user, isOpen, onClose, onSuccess]);

  // Resend timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep('phone_entry');
      setPhoneNumber('');
      setOtpCode('');
      setLocalError(null);
      setIsDemoOtpNotice(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const displayedError = localError || authError;

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch {
      // Error is tracked in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Ensure reCAPTCHA verifier is ready
  const getOrCreateRecaptcha = (): RecaptchaVerifier => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = setupRecaptcha('recaptcha-verifier-container');
    }
    return recaptchaVerifierRef.current;
  };

  // Handle Phone Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);
    clearError();

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 8 || cleanNumber.length > 15) {
      setLocalError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhoneNumber = `${selectedCountryCode}${cleanNumber}`;
    setLoading(true);

    try {
      const verifier = getOrCreateRecaptcha();
      const confirmation = await sendPhoneOtp(fullPhoneNumber, verifier);
      confirmationResultRef.current = confirmation;
      if ('isDemoFallback' in confirmation && confirmation.isDemoFallback) {
        setIsDemoOtpNotice(true);
        setOtpCode('123456');
      } else {
        setIsDemoOtpNotice(false);
      }
      setStep('otp_entry');
      setResendCountdown(45);
    } catch {
      // Error set in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    await handleSendOtp();
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);
    clearError();

    const cleanOtp = otpCode.replace(/[^0-9]/g, '').trim();
    if (cleanOtp.length !== 6) {
      setLocalError('Please enter the full 6-digit OTP code.');
      return;
    }

    if (!confirmationResultRef.current) {
      setLocalError('Session expired. Please request a new OTP.');
      setStep('phone_entry');
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOtp(confirmationResultRef.current, cleanOtp);
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="auth-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            id="auth-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            id="auth-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-[416px] overflow-hidden rounded-[26px] border border-slate-200/90 bg-white p-7 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12),0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] sm:p-8"
          >
            {/* Top Close Button */}
            <button
              id="auth-modal-close-btn"
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4 stroke-[1.75]" />
            </button>

            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-verifier-container" className="flex justify-center" />

            {/* Header Section */}
            <div className="mb-6">
              <div className="mb-4">
                <BrandLogo size="md" />
              </div>
              <h2 className="mt-2 text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
                {t('auth_modal_title')}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                {t('auth_modal_subtitle')}
              </p>
            </div>

            {/* Error Message */}
            {displayedError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-[14px] border border-rose-200/80 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500 stroke-[1.75]" />
                <div className="flex-1 leading-relaxed">{displayedError}</div>
                <button
                  type="button"
                  aria-label="Dismiss error message"
                  onClick={() => {
                    setLocalError(null);
                    clearError();
                  }}
                  className="text-rose-400 transition-colors hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5 stroke-[2]" />
                </button>
              </motion.div>
            )}

            {step === 'phone_entry' ? (
              <div className="space-y-5">
                {/* Google Sign In Button */}
                <button
                  id="auth-google-signin-btn"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="group flex h-12 w-full items-center justify-center gap-3 rounded-[16px] border border-slate-200/90 bg-white px-4 text-[13.5px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50/80 hover:text-slate-900 active:scale-[0.99] disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {/* Google G Logo SVG */}
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{t('continue_with_google')}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800" />
                  <span className="mx-3.5 shrink text-[11.5px] font-normal text-slate-400 dark:text-slate-500">
                    {t('or_continue_with_phone')}
                  </span>
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800" />
                </div>

                {/* Phone Input Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="auth-phone-input"
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {t('phone_number_label')}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          id="auth-country-select"
                          value={selectedCountryCode}
                          onChange={(e) => setSelectedCountryCode(e.target.value)}
                          aria-label="Country Code"
                          className="h-12 appearance-none rounded-[14px] border border-slate-200/90 bg-slate-50/60 pl-3.5 pr-8 text-xs font-semibold text-slate-800 outline-none transition-all duration-150 hover:bg-slate-100/60 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option
                              key={`${c.country}-${c.code}`}
                              value={c.code}
                              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                            >
                              {c.country} ({c.code})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 stroke-[2]" />
                      </div>

                      <div className="relative flex-1">
                        <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 stroke-[1.75]" />
                        <input
                          id="auth-phone-input"
                          type="tel"
                          inputMode="numeric"
                          placeholder={t('phone_placeholder')}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-12 w-full rounded-[14px] border border-slate-200/90 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-white dark:hover:border-slate-600 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                      {t('auth_phone_disclaimer')}
                    </p>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    id="auth-send-otp-btn"
                    type="submit"
                    disabled={loading || !phoneNumber.trim()}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-emerald-500 px-4 text-sm font-semibold text-slate-950 shadow-[0_2px_8px_rgba(16,185,129,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_4px_14px_rgba(16,185,129,0.3)] active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin stroke-[2]" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 stroke-[2]" />
                        <span>{t('send_otp')}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {isDemoOtpNotice && (
                  <div className="flex items-start gap-2.5 rounded-[14px] border border-emerald-200/80 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
                    <div className="flex-1 leading-relaxed">
                      <span className="font-semibold">Demo Phone Mode:</span> Firebase Phone Provider is disabled in console. Use test OTP <strong className="font-mono font-bold tracking-wider text-emerald-950 dark:text-emerald-200">123456</strong> to proceed.
                    </div>
                  </div>
                )}

                <div className="rounded-[16px] border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Code sent to:</span>
                    <button
                      type="button"
                      onClick={() => setStep('phone_entry')}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      <ArrowLeft className="h-3 w-3 stroke-[2]" />
                      <span>{t('change_number')}</span>
                    </button>
                  </div>
                  <div className="mt-1 font-semibold tracking-wide text-slate-900 dark:text-white">
                    {selectedCountryCode} {phoneNumber}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="auth-otp-input"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t('enter_otp')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 stroke-[1.75]" />
                    <input
                      id="auth-otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="h-12 w-full rounded-[14px] border border-slate-200/90 bg-white pl-10 pr-3.5 font-mono text-lg font-bold tracking-[0.3em] text-slate-900 outline-none transition-all duration-150 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-white dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {resendCountdown > 0 ? (
                    <span className="text-slate-400">
                      Resend OTP in <span className="font-semibold text-emerald-600 dark:text-emerald-400">{resendCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-50 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      {t('resend_otp')}
                    </button>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  id="auth-verify-otp-btn"
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-emerald-500 px-4 text-sm font-semibold text-slate-950 shadow-[0_2px_8px_rgba(16,185,129,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_4px_14px_rgba(16,185,129,0.3)] active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin stroke-[2]" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 stroke-[2]" />
                      <span>{t('verify_and_login')}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer reassurance */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400/90 dark:text-slate-500">
              <Lock className="h-3 w-3 stroke-[1.75] text-slate-400" />
              <span>Protected with Google Cloud Firebase 256-bit encryption</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
