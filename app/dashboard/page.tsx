"use client";
import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import KPIGrid from '../../components/KPIGrid';
import ActivityLogger from '../../components/ActivityLogger';
import ActivityTable from '../../components/ActivityTable';
import ResetButton from '../../components/ResetButton';
import FunnelChart from '../../components/FunnelChart';
import CallsTrend from '../../components/CallsTrend';
import TimeFilter from '../../components/TimeFilter';
import FAQ from '../../components/FAQ';

export default function DashboardPage() {
  // filters
  const [pipeline, setPipeline] = useState<string>('ALL');
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  const effectivePipeline = pipeline === 'ALL' ? undefined : pipeline;

  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-purple-600/10 to-cyan-600/10 pointer-events-none"></div>
          <div className="relative bg-gradient-to-r from-slate-900/40 via-slate-800/40 to-slate-900/40 border-b border-cyan-500/20 text-white shadow-lg backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Prospout</h1>
                  <p className="text-slate-400 text-sm mt-1">Commercial Operations Intelligence</p>
                </div>
                <ResetButton />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="mb-8">
            <TimeFilter pipeline={pipeline} setPipeline={(p)=>setPipeline(p)} setFrom={setFrom} setTo={setTo} />
          </div>

          {/* KPI Grid */}
          <div className="mb-8">
            <KPIGrid pipeline={effectivePipeline} from={from} to={to} />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FunnelChart pipeline={effectivePipeline} from={from} to={to} />
            <CallsTrend pipeline={effectivePipeline} from={from} to={to} />
          </div>

          {/* Activity Logger & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
            {/* Main Activity Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-6">Log Activity</h2>
              <ActivityLogger defaultPipeline={effectivePipeline} />

              {/* Activity History */}
              <h2 className="text-2xl font-bold text-white mt-8 mb-6">Activity History</h2>
              <ActivityTable pipeline={effectivePipeline} from={from} to={to} />
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <FAQ />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
