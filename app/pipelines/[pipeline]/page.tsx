"use client";
import Sidebar from '../../../components/Sidebar';
import ActivityLogger from '../../../components/ActivityLogger';
import KPIGrid from '../../../components/KPIGrid';
import PipelineSwitcher from '../../../components/PipelineSwitcher';
import AnalyzeButton from '@/components/AI/AnalyzeButton';
import ConversionCalculator from '@/components/ConversionCalculator';

export default function PipelinePage({ params }: { params: { pipeline: string } }) {
  const pipeline = params.pipeline;
  
  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">{pipeline} Pipeline</h2>
            <div className="flex gap-2">
              <AnalyzeButton />
              <PipelineSwitcher current={pipeline} />
            </div>
          </div>

          <KPIGrid pipeline={pipeline} />

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Lead Conversion Calculator</h3>
            <ConversionCalculator pipeline={pipeline === 'COMPANIES' ? 'COMPANIES' : 'INFLUENCERS'} />
          </section>

          <section className="mt-8 pb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Daily Log — {pipeline}</h3>
            <ActivityLogger defaultPipeline={pipeline} />
          </section>
        </div>
      </main>
    </div>
  );
}
