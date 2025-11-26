"use client";
import { useState } from 'react';
import { Phone, MessageCircle, Mail, Calendar, CheckCircle2 } from 'lucide-react';

export default function ActivityLogger({ defaultPipeline }: { defaultPipeline?: string }) {
  const [pipeline, setPipeline] = useState(defaultPipeline || 'COMPANIES');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  
  // Prospecting
  const [coldCallsMade, setColdCallsMade] = useState(0);
  const [coldCallsAnswered, setColdCallsAnswered] = useState(0);
  const [r1ViaCall, setR1ViaCall] = useState(0);
  const [coldDmsSent, setColdDmsSent] = useState(0);
  const [coldDmsReplied, setColdDmsReplied] = useState(0);
  const [meetsViaDm, setMeetsViaDm] = useState(0);
  const [emailsSent, setEmailsSent] = useState(0);
  const [emailsOpened, setEmailsOpened] = useState(0);
  const [emailsReplied, setEmailsReplied] = useState(0);
  const [meetsViaEmail, setMeetsViaEmail] = useState(0);

  // Meeting pipeline
  const [r1Completed, setR1Completed] = useState(0);
  const [r2Scheduled, setR2Scheduled] = useState(0);
  const [r2Completed, setR2Completed] = useState(0);
  const [r3Scheduled, setR3Scheduled] = useState(0);
  const [r3Completed, setR3Completed] = useState(0);

  // Closing
  const [verbalAgreements, setVerbalAgreements] = useState(0);
  const [dealsClosed, setDealsClosed] = useState(0);
  const [avgTimeToCashDays, setAvgTimeToCashDays] = useState<number | undefined>(undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      userId: 'local-user',
      pipeline,
      date,

      coldCallsMade,
      coldCallsAnswered,
      r1ViaCall,

      coldDmsSent,
      coldDmsReplied,
      meetsViaDm,

      emailsSent,
      emailsOpened,
      emailsReplied,
      meetsViaEmail,

      r1Completed,
      r2Scheduled,
      r2Completed,
      r3Scheduled,
      r3Completed,

      verbalAgreements,
      dealsClosed,
      avgTimeToCashDays,
    };

    await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    
    // Reset form (keep pipeline/date)
    setColdCallsMade(0);
    setColdCallsAnswered(0);
    setR1ViaCall(0);
    setColdDmsSent(0);
    setColdDmsReplied(0);
    setMeetsViaDm(0);
    setEmailsSent(0);
    setEmailsOpened(0);
    setEmailsReplied(0);
    setMeetsViaEmail(0);

    setR1Completed(0);
    setR2Scheduled(0);
    setR2Completed(0);
    setR3Scheduled(0);
    setR3Completed(0);

    setVerbalAgreements(0);
    setDealsClosed(0);
    setAvgTimeToCashDays(undefined);
    
    alert('Activity logged!');
  }

  const inputClass = "w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition";
  const labelClass = "block text-xs font-semibold text-slate-300 mb-1";
  const sectionTitleClass = "text-sm font-bold text-cyan-300 mb-3 pb-2 border-b border-slate-700/50 flex items-center gap-2";

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6 space-y-5 hover:border-cyan-500/40 transition">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Pipeline</label>
              <select value={pipeline} onChange={e=>setPipeline(e.target.value)} className={`${inputClass} bg-slate-800/50`}>
                <option value="COMPANIES">Companies</option>
                <option value="INFLUENCERS">Influencers</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg font-semibold hover:from-cyan-500 hover:to-cyan-600 transition shadow-lg hover:shadow-cyan-500/50">
                Save Activity
              </button>
            </div>
          </div>

          {/* Prospecting Metrics */}
          <div>
            <h4 className={sectionTitleClass}><Phone className="w-4 h-4" /> Prospecting Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Cold calls made</label>
                <input type="number" value={coldCallsMade} onChange={e=>setColdCallsMade(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Answered</label>
                <input type="number" value={coldCallsAnswered} onChange={e=>setColdCallsAnswered(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R1 via call</label>
                <input type="number" value={r1ViaCall} onChange={e=>setR1ViaCall(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R1 completed</label>
                <input type="number" value={r1Completed} onChange={e=>setR1Completed(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
          </div>

          {/* DM Metrics */}
          <div>
            <h4 className={sectionTitleClass}><MessageCircle className="w-4 h-4" /> Cold DMs</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>DMs sent</label>
                <input type="number" value={coldDmsSent} onChange={e=>setColdDmsSent(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>DMs replied</label>
                <input type="number" value={coldDmsReplied} onChange={e=>setColdDmsReplied(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R1 via DM</label>
                <input type="number" value={meetsViaDm} onChange={e=>setMeetsViaDm(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Email Metrics */}
          <div>
            <h4 className={sectionTitleClass}><Mail className="w-4 h-4" /> Email Campaigns</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Emails sent</label>
                <input type="number" value={emailsSent} onChange={e=>setEmailsSent(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Opened</label>
                <input type="number" value={emailsOpened} onChange={e=>setEmailsOpened(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Opened & replied</label>
                <input type="number" value={emailsReplied} onChange={e=>setEmailsReplied(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R1 via email</label>
                <input type="number" value={meetsViaEmail} onChange={e=>setMeetsViaEmail(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Meeting Pipeline */}
          <div>
            <h4 className={sectionTitleClass}><Calendar className="w-4 h-4" /> Meeting Pipeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className={labelClass}>R2 scheduled</label>
                <input type="number" value={r2Scheduled} onChange={e=>setR2Scheduled(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R2 completed</label>
                <input type="number" value={r2Completed} onChange={e=>setR2Completed(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R3 scheduled</label>
                <input type="number" value={r3Scheduled} onChange={e=>setR3Scheduled(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>R3 completed</label>
                <input type="number" value={r3Completed} onChange={e=>setR3Completed(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Closing Metrics */}
          <div>
            <h4 className={sectionTitleClass}><CheckCircle2 className="w-4 h-4" /> Closing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Verbal agreements</label>
                <input type="number" value={verbalAgreements} onChange={e=>setVerbalAgreements(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Deals closed</label>
                <input type="number" value={dealsClosed} onChange={e=>setDealsClosed(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Avg time to cash (days)</label>
                <input type="number" step="0.1" value={avgTimeToCashDays ?? ''} onChange={e=>setAvgTimeToCashDays(e.target.value ? Number(e.target.value) : undefined)} className={inputClass} />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-cyan-500 transition shadow-lg hover:shadow-purple-500/50">
            Log Activity
          </button>
        </div>
      </form>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        <div className="group/card relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-lg blur opacity-0 group-hover/card:opacity-50 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/60 transition">
            <div className="text-slate-400 font-medium">Calls</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{coldCallsMade}</div>
            <div className="text-xs text-slate-500">{coldCallsAnswered} answered</div>
          </div>
        </div>
        <div className="group/card relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-lg blur opacity-0 group-hover/card:opacity-50 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-emerald-500/30 rounded-lg p-4 hover:border-emerald-500/60 transition">
            <div className="text-slate-400 font-medium">R1 Scheduled</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{r1ViaCall}</div>
            <div className="text-xs text-slate-500">Discovery: {r1Completed}</div>
          </div>
        </div>
        <div className="group/card relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-lg blur opacity-0 group-hover/card:opacity-50 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/60 transition">
            <div className="text-slate-400 font-medium">DM Engagement</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">{meetsViaDm}</div>
            <div className="text-xs text-slate-500">{coldDmsSent} sent</div>
          </div>
        </div>
        <div className="group/card relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-lg blur opacity-0 group-hover/card:opacity-50 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-orange-500/30 rounded-lg p-4 hover:border-orange-500/60 transition">
            <div className="text-slate-400 font-medium">Closing</div>
            <div className="text-2xl font-bold text-orange-400 mt-1">{dealsClosed}</div>
            <div className="text-xs text-slate-500">{verbalAgreements} verbal</div>
          </div>
        </div>
      </div>
    </div>
  );
}
