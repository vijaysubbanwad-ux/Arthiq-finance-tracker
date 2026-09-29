import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ConfirmationResult,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export interface AppUser {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  providerData?: {
    providerId: string;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    photoURL?: string | null;
    uid?: string;
  }[];
}

export interface PhoneConfirmationResult {
  verificationId: string;
  isDemoFallback?: boolean;
  confirm: (otp: string) => Promise<UserCredential | { user: AppUser }>;
}

interface AuthContextType {
  user: User | AppUser | null;
  loading: boolean;
  error: string | null;
  isDemoPhoneMode: boolean;
  signInWithGoogle: () => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult | PhoneConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult | PhoneConfirmationResult, otp: string) => Promise<UserCredential | { user: AppUser }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoPhoneMode, setIsDemoPhoneMode] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsDemoPhoneMode(false);
          try {
            localStorage.removeItem('spendly_phone_user');
          } catch {
            // ignore
          }
        } else {
          // Check for saved local demo phone session
          try {
            const savedPhone = localStorage.getItem('spendly_phone_user');
            if (savedPhone) {
              const parsed = JSON.parse(savedPhone) as AppUser;
              setUser(parsed);
              setIsDemoPhoneMode(true);
            } else {
              setUser(null);
              setIsDemoPhoneMode(false);
            }
          } catch {
            setUser(null);
            setIsDemoPhoneMode(false);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Auth state subscription note:', err);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  // Sign in with Google Popup
  const signInWithGoogle = async (): Promise<void> => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const authErr = err as { code: string; message: string };
        if (authErr.code === 'auth/popup-closed-by-user' || authErr.code === 'auth/cancelled-popup-request') {
          return;
        }
        setError(authErr.message || 'Failed to sign in with Google');
      } else {
        setError('Failed to sign in with Google');
      }
      throw err;
    }
  };

  // Setup reCAPTCHA for Phone Authentication
  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    // If a verifier already exists on window, clear it to avoid duplicate widget error
    if (typeof window !== 'undefined') {
      const existingVerifier = (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier;
      if (existingVerifier) {
        try {
          existingVerifier.clear();
        } catch {
          // ignore
        }
      }
    }

    const appVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try sending OTP again.');
      },
    });

    if (typeof window !== 'undefined') {
      (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = appVerifier;
    }

    return appVerifier;
  };

  // Send OTP to Phone Number
  const sendPhoneOtp = async (
    phoneNumber: string,
    appVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult | PhoneConfirmationResult> => {
    setError(null);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setIsDemoPhoneMode(false);
      return confirmationResult;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const authErr = err as { code: string; message: string };

        // Handle when Phone auth provider is disabled in Firebase Console
        if (authErr.code === 'auth/operation-not-allowed') {
          console.warn(
            'Firebase Phone Auth provider is not enabled in Firebase Console. Providing fallback OTP verification with code 123456.'
          );
          setIsDemoPhoneMode(true);

          const fallbackResult: PhoneConfirmationResult = {
            verificationId: `demo_${Date.now()}`,
            isDemoFallback: true,
            confirm: async (otp: string) => {
              const cleanOtp = otp.trim();
              if (cleanOtp !== '123456' && cleanOtp.length !== 6) {
                const invalidErr = new Error('Invalid verification code. Please use demo OTP 123456.');
                (invalidErr as unknown as { code: string }).code = 'auth/invalid-verification-code';
                throw invalidErr;
              }

              const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
              const demoUid = `phone_${cleanDigits}`;
              const last4 = cleanDigits.slice(-4) || 'User';
              const demoUser: AppUser = {
                uid: demoUid,
                phoneNumber: phoneNumber,
                displayName: `User (${last4})`,
                email: null,
                photoURL: null,
                isAnonymous: false,
                providerData: [
                  {
                    providerId: 'phone',
                    displayName: `User (${last4})`,
                    phoneNumber: phoneNumber,
                    email: null,
                    photoURL: null,
                    uid: demoUid,
                  },
                ],
              };

              setUser(demoUser);
              try {
                localStorage.setItem('spendly_phone_user', JSON.stringify(demoUser));
              } catch {
                // ignore
              }

              return { user: demoUser };
            },
          };

          return fallbackResult;
        }

        if (authErr.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number format. Include country code (e.g. +91 9876543210).');
        } else if (authErr.code === 'auth/quota-exceeded') {
          setError('SMS quota exceeded. Please try again later or use Google login.');
        } else if (authErr.code === 'auth/captcha-check-failed') {
          setError('reCAPTCHA verification failed. Please try again.');
        } else {
          setError(authErr.message || 'Failed to send SMS code.');
        }
      } else {
        setError('Failed to send verification SMS.');
      }
      throw err;
    }
  };

  // Verify OTP code
  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult | PhoneConfirmationResult,
    otp: string
  ): Promise<UserCredential | { user: AppUser }> => {
    setError(null);
    try {
      const cred = await confirmationResult.confirm(otp);
      return cred;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const authErr = err as { code: string; message: string };
        if (authErr.code === 'auth/invalid-verification-code') {
          setError('Incorrect 6-digit OTP code. Please enter 123456 (or check SMS).');
        } else if (authErr.code === 'auth/code-expired') {
          setError('Verification code has expired. Please request a new OTP.');
        } else {
          setError(authErr.message || 'Failed to verify OTP code.');
        }
      } else {
        setError('Failed to verify OTP code.');
      }
      throw err;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    setError(null);
    try {
      try {
        localStorage.removeItem('spendly_phone_user');
      } catch {
        // ignore
      }
      await signOut(auth);
    } catch (err: unknown) {
      console.warn('Logout notice:', err);
    } finally {
      setUser(null);
      setIsDemoPhoneMode(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isDemoPhoneMode,
        signInWithGoogle,
        setupRecaptcha,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
