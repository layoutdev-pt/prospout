"use client";
import { useEffect, useState } from 'react';

type Activity = any;

export default function ActivityTable({ pipeline, from, to }: { pipeline?: string; from?: string; to?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const params = new URLSearchParams();
      if (pipeline) params.set('pipeline', pipeline);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const q = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/activities${q}`);
      const data = await res.json();
      setActivities(data.activities || []);
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, [pipeline, from, to]);

  if (activities.length === 0) {
    return <div className="text-center text-slate-400 py-8 card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-slate-700/50 rounded-lg">No activities logged yet</div>;
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-emerald-500/20 rounded-xl overflow-hidden hover:border-emerald-500/40 transition">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 border-b border-emerald-500/20">
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase">Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-cyan-400 uppercase">Pipeline</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">Calls</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">Answered</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">R1 Meetings</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">R1 Completed</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">R2</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">R3</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">Verbal</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase">Deals</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={a.id} className={`border-b border-slate-700/30 ${i % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-900/20'} hover:bg-slate-800/50 transition`}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-300">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.pipeline === 'COMPANIES' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'}`}>
                      {a.pipeline}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-cyan-400">{a.coldCallsMade}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-300">{a.coldCallsAnswered}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-400">{(a.r1ViaCall||0) + (a.meetsViaDm||0) + (a.meetsViaEmail||0)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-300">{a.r1Completed || 0}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-300">{(a.r2Scheduled||0)}/{(a.r2Completed||0)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-300">{(a.r3Scheduled||0)}/{(a.r3Completed||0)}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-orange-400">{a.verbalAgreements || 0}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-red-400">{a.dealsClosed || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
