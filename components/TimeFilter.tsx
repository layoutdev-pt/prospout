"use client";
import React, { useState } from 'react';

export default function TimeFilter({ pipeline, setPipeline, setFrom, setTo }: { pipeline?: string; setPipeline: (p: string)=>void; setFrom: (f?: string)=>void; setTo: (t?: string)=>void }) {
  const [range, setRange] = useState<'daily'|'weekly'|'monthly'|'annual'|'custom'>('monthly');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

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
    }
    setFrom(from);
    setTo(to);
  }

  const buttonClass = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg hover:shadow-cyan-500/50' : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-300'}`;

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4 space-y-4 hover:border-cyan-500/40 transition">
        {/* Pipeline selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Pipeline</label>
          <select value={pipeline} onChange={e=>setPipeline(e.target.value)} className="w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition">
            <option value="ALL">All Pipelines</option>
            <option value="COMPANIES">Companies</option>
            <option value="INFLUENCERS">Influencers</option>
          </select>
        </div>

        {/* Time range buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Date Range</label>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={()=>applyRange('daily')} className={buttonClass(range === 'daily')}>Today</button>
            <button type="button" onClick={()=>applyRange('weekly')} className={buttonClass(range === 'weekly')}>7 Days</button>
            <button type="button" onClick={()=>applyRange('monthly')} className={buttonClass(range === 'monthly')}>30 Days</button>
            <button type="button" onClick={()=>applyRange('annual')} className={buttonClass(range === 'annual')}>Year</button>
          </div>
        </div>

        {/* Custom date range */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Custom Range</label>
          <div className="flex gap-2">
            <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="flex-1 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition" placeholder="From" />
            <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="flex-1 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition" placeholder="To" />
            <button type="button" onClick={()=>applyRange('custom')} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-cyan-600 transition">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
