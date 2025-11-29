"use client";
import SettingsForm from '@/components/SettingsForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsContent() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-slate-500">{t('Control Center')}</p>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
          {t('Platform Settings')}
        </h1>
        <p className="text-slate-400 mt-2 max-w-3xl">
          {t(
            'Configure which inputs are required for your pipelines, manage KPI visibility, and tailor the dashboard language to your team. These preferences apply everywhere in the Growth KPIs App experience.'
          )}
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}

