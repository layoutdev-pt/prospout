"use client";
import { SettingsProvider } from '@/contexts/SettingsContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

