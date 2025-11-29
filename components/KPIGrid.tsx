"use client";
import { useEffect, useState } from 'react';
import {
  Phone,
  PhoneCall,
  CalendarCheck,
  MessageSquare,
  Mail,
  ArrowRight,
  Award,
  PartyPopper,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const emptyTotals = {
  totalCalls: 0,
  coldCallsAnswered: 0,
  r1Completed: 0,
  coldDmsSent: 0,
  emailsSent: 0,
  r2Scheduled: 0,
  r3Scheduled: 0,
  verbalAgreements: 0,
};

const emptyData = {
  totals: emptyTotals,
  totalDeals: 0,
  avgTimeToCashDays: null,
  pctCallsAnswered: 0,
  pctR1ShowRate: 0,
  pctDmResponse: 0,
  pctEmailOpen: 0,
  pctR1ToR2: 0,
  pctR2ToR3: 0,
  pctR1ToVerbal: 0,
  pctR1ToClose: 0,
  pctR2ToClose: 0,
  pctR3ToClose: 0,
  pctR2ShowRate: 0,
  pctR3ShowRate: 0,
};

function TrendIcon({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-400">—</span>;
  if (value > 0) return <ArrowUp className="text-green-600" />;
  return <ArrowDown className="text-red-600" />;
}

export default function KPIGrid({ pipeline, from, to }: { pipeline?: string; from?: string; to?: string }) {
  const [data, setData] = useState<any>(emptyData);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let stopped = false;
    const ac = new AbortController();
    const params = new URLSearchParams();
    if (pipeline) params.set('pipeline', pipeline);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';

    fetch(`/api/analytics${query}`, { signal: ac.signal })
      .then(r => r.json())
      .then(d => {
        if (stopped) return;
        setData({
          ...emptyData,
          ...d,
          totals: { ...emptyTotals, ...(d?.totals || {}) },
        });
        setLoading(false);
      })
      .catch(e => {
        const msg = String(e || '')
        if (msg.includes('Abort') || msg.includes('aborted')) {
          setLoading(false);
          return;
        }
        console.error(e);
        setData(emptyData);
        setLoading(false);
      });

    let tickAc: AbortController | null = null;
    const interval = setInterval(() => {
      tickAc && tickAc.abort();
      tickAc = new AbortController();
      fetch(`/api/analytics${query}`, { signal: tickAc.signal })
        .then(r => r.json())
        .then(d =>
          setData({
            ...emptyData,
            ...d,
            totals: { ...emptyTotals, ...(d?.totals || {}) },
          })
        )
        .catch(e => {
          const msg = String(e || '')
          if (msg.includes('Abort') || msg.includes('aborted')) return;
          console.error(e);
          setData(emptyData);
        });
    }, 8000);

    return () => {
      stopped = true;
      ac.abort();
      if (tickAc) tickAc.abort();
      clearInterval(interval);
    };
  }, [pipeline, from, to]);

  if (loading) return <div className="text-center py-8 text-slate-500">{t('Loading KPIs…')}</div>;

  const totals = data.totals || {};

  // KPI items with metadata
  const kpis = [
    { label: t('Cold Calls'), value: totals.totalCalls, sublabel: t('made'), color: 'from-blue-500 to-blue-600', icon: <Phone size={28} /> },
    {
      label: t('Calls Answered'),
      value: totals.coldCallsAnswered,
      sublabel: `${data.pctCallsAnswered}% ${t('% rate')}`,
      color: 'from-cyan-500 to-cyan-600',
      icon: <PhoneCall size={28} />,
    },
    {
      label: t('R1 Scheduled'),
      value: data.totalR1Scheduled || 0,
      sublabel: `${data.pctR1ShowRate}% ${t('% show rate')}`,
      color: 'from-emerald-500 to-emerald-600',
      icon: <CalendarCheck size={28} />,
    },
    {
      label: t('DMs Sent'),
      value: totals.coldDmsSent,
      sublabel: `${data.pctDmResponse}% ${t('% reply rate')}`,
      color: 'from-violet-500 to-violet-600',
      icon: <MessageSquare size={28} />,
    },
    {
      label: t('Emails Sent'),
      value: totals.emailsSent,
      sublabel: `${data.pctEmailOpen}% ${t('Opened')}`,
      color: 'from-orange-500 to-orange-600',
      icon: <Mail size={28} />,
    },
    {
      label: t('R2 Scheduled'),
      value: totals.r2Scheduled,
      sublabel: `${data.pctR1ToR2}% ${t('% from R1')}`,
      color: 'from-pink-500 to-pink-600',
      icon: <ArrowRight size={28} />,
    },
    {
      label: t('R3 Scheduled'),
      value: totals.r3Scheduled,
      sublabel: `${data.pctR2ToR3}% ${t('% from R2')}`,
      color: 'from-indigo-500 to-indigo-600',
      icon: <ArrowRight size={28} />,
    },
    {
      label: t('Deals Closed'),
      value: data.totalDeals,
      sublabel: `${totals.totalCalls > 0 ? Math.round(totals.totalCalls / Math.max(data.totalDeals, 1)) : 0} ${t('calls/deal')}`,
      color: 'from-red-500 to-red-600',
      icon: <PartyPopper size={28} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(0, 4).map((kpi, i) => (
          <div key={i} className="group relative">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${kpi.color} rounded-xl blur opacity-0 group-hover:opacity-60 transition duration-1000`}></div>
            <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6 transform transition hover:scale-105 hover:border-cyan-500/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">{kpi.label}</div>
                  <div className="text-4xl font-bold mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{kpi.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{kpi.sublabel}</div>
                </div>
                <div className="opacity-40 group-hover:opacity-60 transition">{kpi.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(4).map((kpi, i) => (
          <div key={i} className="group relative">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${kpi.color} rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-1000`}></div>
            <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-purple-500/20 rounded-xl p-6 transform transition hover:scale-105 hover:border-purple-500/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">{kpi.label}</div>
                  <div className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">{kpi.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{kpi.sublabel}</div>
                </div>
                <div className="opacity-40 group-hover:opacity-60 transition">{kpi.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Conversion Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/60 transition">
            <div className="text-sm font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
              {t('Conversion Rates')}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('R1 → Verbal')}</span>
                <span className="text-lg font-bold text-cyan-400">{data.pctR1ToVerbal}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('R1 → Close')}</span>
                <span className="text-lg font-bold text-emerald-400">{data.pctR1ToClose}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('R2 → Close')}</span>
                <span className="text-lg font-bold text-purple-400">{data.pctR2ToClose}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/60 transition">
            <div className="text-sm font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
              {t('Show-up Rates')}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('R1 Show')}</span>
                <span className="text-lg font-bold text-emerald-400">{data.pctR1ShowRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('R2 Show')}</span>
                <span className="text-lg font-bold text-cyan-400">{data.pctR2ShowRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('R3 Show')}</span>
                <span className="text-lg font-bold text-purple-400">{data.pctR3ShowRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/60 transition">
            <div className="text-sm font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
              {t('Performance')}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('Verbal Agreements')}</span>
                <span className="text-lg font-bold text-orange-400">{totals.verbalAgreements}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('Avg Time to Cash')}</span>
                <span className="text-lg font-bold text-red-400">
                  {data.avgTimeToCashDays ?? '—'} {t('days')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{t('Calls per Deal')}</span>
                <span className="text-lg font-bold text-slate-300">
                  {totals.totalCalls > 0 ? Math.round(totals.totalCalls / Math.max(data.totalDeals, 1)) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
