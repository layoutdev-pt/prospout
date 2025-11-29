"use client";
import { useTranslation } from '@/hooks/useTranslation';

export default function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 py-4 px-6 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-600 font-medium">{t('PROSPOUT INSIGHTS')}</div>
          <a
            href="https://www.layoutagency.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
          >
            <span className="font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300">
              LAYOUT AGENCY
            </span>
            <svg className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700/30 text-center">
          <p className="text-xs text-slate-500 watermark">
            {t('Built by')} <span className="text-cyan-600 font-semibold">Layout Agency</span> •{' '}
            <a href="https://www.layoutagency.pt" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 ml-1">
              layoutagency.pt
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

