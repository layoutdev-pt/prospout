"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function TimeFilter({ pipeline, setPipeline, setFrom, setTo }: { pipeline?: string; setPipeline: (p: string)=>void; setFrom: (f?: string)=>void; setTo: (t?: string)=>void }) {
  const [range, setRange] = useState<'daily'|'weekly'|'monthly'|'annual'|'custom'|'month'|'quarter'>('monthly');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(new Date().getMonth()+1);
  const [quarter, setQuarter] = useState<1|2|3|4>(1);
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    const qYear = parseInt(search.get('year')||'');
    const qMonth = parseInt(search.get('month')||'');
    const qRange = (search.get('range') as any) || null;
    const qQuarter = parseInt(search.get('quarter')||'') as any;
    if (!isNaN(qYear)) setYear(qYear);
    if (!isNaN(qMonth)) setMonth(qMonth);
    if (qRange && ['daily','weekly','monthly','annual','custom','month','quarter'].includes(qRange)) setRange(qRange);
    if ([1,2,3,4].includes(qQuarter)) setQuarter(qQuarter);
  }, [search]);

  const writeURL = (params: Record<string,string|number|undefined>) => {
    const current = new URLSearchParams(search.toString());
    Object.entries(params).forEach(([k,v]) => {
      if (v === undefined || v === '') current.delete(k); else current.set(k, String(v));
    });
    router.replace(`${pathname}?${current.toString()}`);
  };

  function applyRange(r: typeof range) {
    setRange(r);
    const today = new Date();
    let from: string | undefined;
    let to: string | undefined;
    if (r === 'daily') {
      from = today.toISOString().slice(0,10);
      to = from;
    } else if (r === 'weekly') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      from = start.toISOString().slice(0,10);
      to = today.toISOString().slice(0,10);
    } else if (r === 'monthly') {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      from = start.toISOString().slice(0,10);
      to = today.toISOString().slice(0,10);
    } else if (r === 'annual') {
      const start = new Date(today);
      start.setFullYear(today.getFullYear() - 1);
      from = start.toISOString().slice(0,10);
      to = today.toISOString().slice(0,10);
    } else if (r === 'custom') {
      from = customFrom || undefined;
      to = customTo || undefined;
    } else if (r === 'month') {
      const ys = year;
      const ms = month;
      const start = new Date(Date.UTC(ys, ms-1, 1));
      const end = new Date(Date.UTC(ys, ms, 0));
      from = start.toISOString().slice(0,10);
      to = end.toISOString().slice(0,10);
    } else if (r === 'quarter') {
      const ys = year;
      const q = quarter;
      const startMonth = (q-1)*3 + 1;
      const endMonth = startMonth + 2;
      const start = new Date(Date.UTC(ys, startMonth-1, 1));
      const end = new Date(Date.UTC(ys, endMonth, 0));
      from = start.toISOString().slice(0,10);
      to = end.toISOString().slice(0,10);
    }
    setFrom(from);
    setTo(to);
    writeURL({ range: r, from, to, year, month, quarter });
  }

  const buttonClass = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg hover:shadow-cyan-500/50' : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-300'}`;

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4 space-y-4 hover:border-cyan-500/40 transition">
        {/* Pipeline selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">{t('Pipeline')}</label>
          <select value={pipeline} onChange={e=>setPipeline(e.target.value)} className="w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition">
            <option value="ALL">{t('All Pipelines')}</option>
            <option value="COMPANIES">{t('Companies')}</option>
            <option value="INFLUENCERS">{t('Influencers')}</option>
          </select>
        </div>

        {/* Time range buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">{t('Date Range')}</label>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={()=>applyRange('daily')} className={buttonClass(range === 'daily')}>{t('Today')}</button>
            <button type="button" onClick={()=>applyRange('weekly')} className={buttonClass(range === 'weekly')}>{t('7 Days')}</button>
            <button type="button" onClick={()=>applyRange('monthly')} className={buttonClass(range === 'monthly')}>{t('30 Days')}</button>
            <button type="button" onClick={()=>applyRange('annual')} className={buttonClass(range === 'annual')}>{t('Year')}</button>
          </div>
        </div>

        {/* Month & Year selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">{t('Month View')}</label>
          <div className="flex gap-2 items-center">
            <select value={month} onChange={e=>setMonth(parseInt(e.target.value))} className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100">
              {Array.from({length:12}, (_,i)=>i+1).map(m=> (
                <option key={m} value={m}>{new Date(2025, m-1, 1).toLocaleString(undefined,{ month:'long' })}</option>
              ))}
            </select>
            <input type="number" value={year} onChange={e=>setYear(parseInt(e.target.value||'2026'))} className="w-24 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100" />
            <button type="button" onClick={()=>applyRange('month')} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg text-sm font-medium">{t('Apply Month')}</button>
          </div>
        </div>

        {/* Quarter selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">{t('Quarter')}</label>
          <div className="flex gap-2">
            {[1,2,3,4].map(q => (
              <button key={q} type="button" onClick={()=>{ setQuarter(q as any); applyRange('quarter'); }} className={buttonClass(range==='quarter' && quarter===q)}>
                {`Q${q}`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">{t('Custom Range')}</label>
          <div className="flex gap-2">
            <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="flex-1 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition" placeholder={t('From')} />
            <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="flex-1 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition" placeholder={t('To')} />
            <button type="button" onClick={()=>applyRange('custom')} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-cyan-600 transition">
              {t('Apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
