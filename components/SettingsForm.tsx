"use client";
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/hooks/useTranslation';

const INPUT_GROUPS = [
  {
    title: 'Cold Outreach Metrics',
    inputs: [
      { key: 'cold_calls', label: 'Cold Calls (made + answered)' },
      { key: 'r1_via_call', label: 'R1 meetings via cold call' },
      { key: 'cold_dms', label: 'Cold DMs (sent + replied)' },
      { key: 'r1_via_dm', label: 'R1 meetings via DM' },
      { key: 'emails', label: 'Emails (sent / opened / replied)' },
      { key: 'r1_via_email', label: 'R1 meetings via email' },
    ],
  },
  {
    title: 'Meeting Pipeline Metrics',
    inputs: [
      { key: 'r1_completed', label: 'Discovery (R1) completed' },
      { key: 'r2', label: 'Follow-up (R2) scheduled & completed' },
      { key: 'r3', label: 'Q&A (R3) scheduled & completed' },
    ],
  },
  {
    title: 'Closing Metrics',
    inputs: [
      { key: 'verbal_agreements', label: 'Verbal agreements' },
      { key: 'deals_closed', label: 'Deals closed' },
      { key: 'time_to_cash', label: 'Time to cash (days)' },
    ],
  },
];

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-Hans', label: '中文 (简体)' },
  { code: 'zh-Hant', label: '中文 (繁體)' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'pl', label: 'Polski' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'da', label: 'Dansk' },
  { code: 'cs', label: 'Čeština' },
  { code: 'hu', label: 'Magyar' },
  { code: 'ro', label: 'Română' },
  { code: 'uk', label: 'Українська' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
];

export default function SettingsForm() {
  const { settings, hydrated, saveSettings } = useSettings();
  const [draft, setDraft] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');
  const [customLanguage, setCustomLanguage] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (hydrated) {
      setDraft(settings);
    }
  }, [settings, hydrated]);

  const availableSecondaryLanguages = useMemo(() => {
    return LANGUAGE_OPTIONS.filter((lang) => lang.code !== draft.preferredLanguage);
  }, [draft.preferredLanguage]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  function toggleInput(key: string) {
    setDraft((prev) => {
      const exists = prev.enabledInputs.includes(key);
      return {
        ...prev,
        enabledInputs: exists
          ? prev.enabledInputs.filter((item) => item !== key)
          : [...prev.enabledInputs, key],
      };
    });
  }

  function handleLanguageChange(value: string) {
    setDraft((prev) => ({
      ...prev,
      preferredLanguage: value,
      secondaryLanguages: prev.secondaryLanguages.filter((code) => code !== value),
    }));
  }

  function handleSecondaryLanguageToggle(code: string) {
    setDraft((prev) => {
      const exists = prev.secondaryLanguages.includes(code);
      return {
        ...prev,
        secondaryLanguages: exists
          ? prev.secondaryLanguages.filter((lang) => lang !== code)
          : [...prev.secondaryLanguages, code],
      };
    });
  }

  function handleCustomLanguageAdd() {
    const code = customLanguage.trim();
    if (!code) return;
    setDraft((prev) => ({
      ...prev,
      secondaryLanguages: prev.secondaryLanguages.includes(code)
        ? prev.secondaryLanguages
        : [...prev.secondaryLanguages, code],
    }));
    setCustomLanguage('');
  }

  function handleSave() {
    saveSettings(draft);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  }

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
        {t('Loading settings…')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="card bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{t('Input & KPI Configuration')}</h2>
            <p className="text-sm text-slate-400">{t('Choose which inputs the team needs to fill every day.')}</p>
          </div>
          {status === 'saved' && !dirty && <span className="text-xs text-emerald-400 font-semibold">{t('Saved')}</span>}
        </div>
        <div className="mt-6 space-y-6">
          {INPUT_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">{t(group.title)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.inputs.map((input) => (
                  <label
                    key={input.key}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                      draft.enabledInputs.includes(input.key)
                        ? 'border-cyan-500/40 bg-cyan-500/5'
                        : 'border-slate-700/40 hover:border-slate-600/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft.enabledInputs.includes(input.key)}
                      onChange={() => toggleInput(input.key)}
                      className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-slate-200">{t(input.label)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 border border-purple-500/20 rounded-xl p-6 shadow-lg space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">{t('Language & Localization')}</h2>
          <p className="text-sm text-slate-400">
            {t('Pick the default language for dashboards and allow teammates to switch to additional languages.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t('Primary language')}</p>
            <select
              value={draft.preferredLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/70 border border-slate-700/70 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t('Secondary languages')}</p>
            <div className="flex flex-wrap gap-2">
              {availableSecondaryLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSecondaryLanguageToggle(lang.code)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold border transition ${
                    draft.secondaryLanguages.includes(lang.code)
                      ? 'border-purple-500/60 bg-purple-500/15 text-purple-200'
                      : 'border-slate-700/60 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t('Add any ISO language code')}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              placeholder="e.g. en-GB, pt-BR, zh-CN"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/60 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleCustomLanguageAdd}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-sm font-semibold text-white hover:from-purple-500 hover:to-cyan-500 transition"
            >
              {t('Add')}
            </button>
          </div>
          {draft.secondaryLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              {draft.secondaryLanguages.map((code) => (
                <span
                  key={code}
                  className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600/80 flex items-center gap-2"
                >
                  {code}
                  <button
                    type="button"
                    className="text-slate-400 hover:text-red-300"
                    onClick={() => handleSecondaryLanguageToggle(code)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card bg-gradient-to-br from-slate-900/30 via-slate-900/20 to-slate-900/30 border border-slate-700/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">{t('How these settings are used')}</h2>
        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
          <li>{t('Input toggles control which fields appear on the Activity Logger and pipeline pages.')}</li>
          <li>{t('Language preferences tell the UI which locale to load first; secondary languages can be offered per user.')}</li>
          <li>{t('Custom ISO codes let you support any locale in the world—even if it’s not in the predefined list.')}</li>
          <li>{t('All settings are stored locally for now; hook them to Supabase later for multi-device sync.')}</li>
        </ul>
      </section>

      <div className="flex items-center justify-end gap-4">
        {dirty && <span className="text-xs text-slate-400">{t('Unsaved changes')}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('Save settings')}
        </button>
      </div>
    </div>
  );
}

