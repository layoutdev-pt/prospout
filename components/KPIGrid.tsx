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

function TrendIcon({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-400">—</span>;
  if (value > 0) return <ArrowUp className="text-green-600" />;
  return <ArrowDown className="text-red-600" />;
}

export default function KPIGrid({ pipeline, from, to }: { pipeline?: string; from?: string; to?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (pipeline) params.set('pipeline', pipeline);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';

    fetch(`/api/analytics${query}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });

    const interval = setInterval(() => {
      fetch(`/api/analytics${query}`)
        .then(r => r.json())
        .then(d => setData(d))
        .catch(e => console.error(e));
    }, 3000);

    return () => clearInterval(interval);
  }, [pipeline, from, to]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading KPIs…</div>;
  if (!data) return <div className="text-center py-8 text-slate-500">No data</div>;

  const t = data.totals || {};

  // KPI items with metadata
  const kpis = [
    { label: 'Cold Calls', value: t.totalCalls, sublabel: 'made', color: 'from-blue-500 to-blue-600', icon: <Phone size={28} /> },
    { label: 'Calls Answered', value: t.coldCallsAnswered, sublabel: `${data.pctCallsAnswered}% rate`, color: 'from-cyan-500 to-cyan-600', icon: <PhoneCall size={28} /> },
    { label: 'R1 Scheduled', value: t.r1Completed, sublabel: `${data.pctR1ShowRate}% show rate`, color: 'from-emerald-500 to-emerald-600', icon: <CalendarCheck size={28} /> },
    { label: 'DMs Sent', value: t.coldDmsSent, sublabel: `${data.pctDmResponse}% reply rate`, color: 'from-violet-500 to-violet-600', icon: <MessageSquare size={28} /> },
    { label: 'Emails Sent', value: t.emailsSent, sublabel: `${data.pctEmailReply}% open+reply`, color: 'from-orange-500 to-orange-600', icon: <Mail size={28} /> },
    { label: 'R2 Scheduled', value: t.r2Scheduled, sublabel: `${data.pctR1ToR2}% from R1`, color: 'from-pink-500 to-pink-600', icon: <ArrowRight size={28} /> },
    { label: 'R3 Scheduled', value: t.r3Scheduled, sublabel: `${data.pctR2ToR3}% from R2`, color: 'from-indigo-500 to-indigo-600', icon: <ArrowRight size={28} /> },
    { label: 'Deals Closed', value: data.totalDeals, sublabel: `${t.totalCalls > 0 ? Math.round(t.totalCalls / Math.max(data.totalDeals, 1)) : 0} calls/deal`, color: 'from-red-500 to-red-600', icon: <PartyPopper size={28} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/60 transition">
            <div className="text-sm font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
              Conversion Rates
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">R1 → Verbal</span>
                <span className="text-lg font-bold text-cyan-400">{data.pctR1ToVerbal}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">R1 → Close</span>
                <span className="text-lg font-bold text-emerald-400">{data.pctR1ToClose}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">R2 → Close</span>
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
              Show-up Rates
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">R1 Show</span>
                <span className="text-lg font-bold text-emerald-400">{data.pctR1ShowRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">R2 Show</span>
                <span className="text-lg font-bold text-cyan-400">{data.pctR2ShowRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">R3 Show</span>
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
              Performance
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Verbal Agreements</span>
                <span className="text-lg font-bold text-orange-400">{t.verbalAgreements}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Avg Time to Cash</span>
                <span className="text-lg font-bold text-red-400">{data.avgTimeToCashDays ?? '—'} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Calls per Deal</span>
                <span className="text-lg font-bold text-slate-300">{t.totalCalls > 0 ? Math.round(t.totalCalls / Math.max(data.totalDeals, 1)) : 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
