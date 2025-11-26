"use client";
import { useRouter } from 'next/navigation';

export default function PipelineSwitcher({ current }: { current?: string }) {
  const router = useRouter();
  const switchTo = (p: string) => router.push(`/pipelines/${p}`);

  const buttonClass = (active: boolean) => `px-3 py-1 rounded-lg text-sm font-medium transition ${active ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg' : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-300'}`;

  return (
    <div className="flex gap-2">
      <button onClick={() => router.push('/dashboard')} className={buttonClass(!current)}>Combined</button>
      <button onClick={() => switchTo('COMPANIES')} className={buttonClass(current==='COMPANIES')}>Companies</button>
      <button onClick={() => switchTo('INFLUENCERS')} className={buttonClass(current==='INFLUENCERS')}>Influencers</button>
    </div>
  );
}
