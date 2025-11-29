"use client";
import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar } from 'recharts';

type Activity = any;

export default function CallsTrend({ pipeline, from, to }: { pipeline?: string; from?: string; to?: string }) {
  const [data, setData] = useState<Array<{ date: string; calls: number; r1: number; deals: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      const params = new URLSearchParams();
      if (pipeline) params.set('pipeline', pipeline);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const q = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/analytics${q}`, { signal });
      const json = await res.json();
      const ts = json.timeSeries || [];

      const out = ts.map((d: any) => ({ date: d.date, calls: d.calls || 0, r1: d.r1Completed || 0, deals: d.dealsClosed || 0 }));
      setData(out);
    } catch (err) {
      const msg = String(err || '');
      if (msg.includes('Abort') || msg.includes('aborted')) {
      } else {
        console.error('CallsTrend fetch error', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);
    let tickAc: AbortController | null = null;
    const t = setInterval(() => {
      if (tickAc) tickAc.abort();
      tickAc = new AbortController();
      fetchData(tickAc.signal);
    }, 10000);
    return () => {
      ac.abort();
      if (tickAc) tickAc.abort();
      clearInterval(t);
    };
  }, [pipeline, from, to]);

  if (loading) return <div className="p-4 text-slate-400">Loading trend…</div>;

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/60 transition">
        <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
          <TrendingUp className="w-5 h-5" />Activity Trend
        </h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value) => `${value}`}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="calls" fill="#00d9ff" name="Calls" radius={[4, 4, 0, 0]} />
              <Bar dataKey="r1" fill="#10b981" name="R1 Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deals" fill="#ff6b35" name="Deals Closed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
