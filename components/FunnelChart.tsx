"use client";
import React, { useEffect, useState } from 'react';
import { Funnel as FunnelIcon } from 'lucide-react';
import { ResponsiveContainer, FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList } from 'recharts';

type Analytics = {
  totals: any;
  totalDeals: number;
};

export default function FunnelChart({ pipeline, from, to }: { pipeline?: string; from?: string; to?: string }) {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (pipeline) params.set('pipeline', pipeline);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const q = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/analytics${q}`);
      const json: Analytics = await res.json();
      const t = json.totals || {};
      const d = [
        { name: 'Calls Made', value: t.totalCalls || 0 },
        { name: 'Calls Answered', value: t.coldCallsAnswered || 0 },
        { name: 'R1 Completed', value: t.r1Completed || 0 },
        { name: 'Deals', value: json.totalDeals || 0 },
      ];
      setData(d);
    } catch (err) {
      console.error('Funnel fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [pipeline, from, to]);

  if (loading) return <div className="p-4 text-slate-400">Loading funnel…</div>;

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/60 transition">
        <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <FunnelIcon className="w-5 h-5" />
          Sales Funnel
        </h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <RechartsFunnelChart>
              <Tooltip formatter={(value) => `${value} leads`} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 0 20px rgba(121, 40, 202, 0.3)' }} labelStyle={{ color: '#94a3b8' }} />
              <Funnel dataKey="value" data={data} isAnimationActive fill="#7928ca">
                <LabelList position="right" stroke="#cbd5e1" dataKey="name" />
              </Funnel>
            </RechartsFunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
