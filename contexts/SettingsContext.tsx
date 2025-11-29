"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppSettings = {
  enabledInputs: string[];
  preferredLanguage: string;
  secondaryLanguages: string[];
};

export const SETTINGS_STORAGE_KEY = 'prospout_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  enabledInputs: [
    'cold_calls',
    'r1_via_call',
    'cold_dms',
    'r1_via_dm',
    'emails',
    'r1_via_email',
    'r1_completed',
    'r2',
    'r3',
    'verbal_agreements',
    'deals_closed',
    'time_to_cash',
  ],
  preferredLanguage: 'en',
  secondaryLanguages: ['pt'],
};

type SettingsContextValue = {
  settings: AppSettings;
  hydrated: boolean;
  saveSettings: (next: AppSettings) => void;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  saveSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          enabledInputs: parsed.enabledInputs ?? DEFAULT_SETTINGS.enabledInputs,
          preferredLanguage: parsed.preferredLanguage ?? DEFAULT_SETTINGS.preferredLanguage,
          secondaryLanguages: parsed.secondaryLanguages ?? DEFAULT_SETTINGS.secondaryLanguages,
        });
      }
    } catch (err) {
      console.warn('Failed to load saved settings', err);
    } finally {
      setHydrated(true);
    }
  }, []);

  const saveSettings = (next: AppSettings) => {
    setSettings(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const value = useMemo(
    () => ({
      settings,
      hydrated,
      saveSettings,
    }),
    [settings, hydrated]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

