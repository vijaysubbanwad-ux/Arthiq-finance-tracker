import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types';
import { StorageService } from '../utils/storage';
import {
  SUPPORTED_LANGUAGES,
  t as translateHelper,
  translateCategory as catHelper,
  translatePaymentMethod as pmHelper,
  TranslationKey,
} from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  translateCategory: (category: string) => string;
  translatePaymentMethod: (method: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translateHelper(key, 'en'),
  translateCategory: (cat) => catHelper(cat, 'en'),
  translatePaymentMethod: (pm) => pmHelper(pm, 'en'),
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}> = ({ children, initialLanguage, onLanguageChange }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (initialLanguage) return initialLanguage;
    const profile = StorageService.getUserProfile();
    return (profile?.language as Language) || 'en';
  });

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    StorageService.updateUserProfile({ language: newLang });
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const t = (key: TranslationKey) => translateHelper(key, language);
  const translateCategory = (cat: string) => catHelper(cat, language);
  const translatePaymentMethod = (pm: string) => pmHelper(pm, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCategory,
        translatePaymentMethod,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
