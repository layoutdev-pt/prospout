"use client";
import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { translate } from '@/lib/i18n/translations';

export function useTranslation() {
  const { settings } = useSettings();
  const language = settings?.preferredLanguage || 'en';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  function t(key: string) {
    return translate(language, key);
  }

  return { t, language };
}

