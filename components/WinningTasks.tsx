"use client";
import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Clock, Download, Share2, Trophy } from 'lucide-react'

type Item = { id: string; title: string; description?: string; reward?: string; mediaUrl?: string; createdAt: string; completedAt?: string; claimedAt?: string }

export default function WinningTasks(){
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scoreRows, setScoreRows] = useState<{ impactPct: number; easePct: number }[]>(Array.from({ length: 10 }, () => ({ impactPct: 0, easePct: 0 })))
  const [eodWins, setEodWins] = useState('')
  const [eodIssues, setEodIssues] = useState('')
  const [eodLogs, setEodLogs] = useState<Record<string, { wins: string[]; issues: string[] }>>({})

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      setLoading(true); setError(null)
      try{
        const res = await fetch('/api/winning-tasks', { signal: ac.signal })
        const data = await res.json()
        setItems(data.items || [])
      }catch(e){
        const msg = String(e||'')
        if (!msg.includes('Abort')) setError('Falha ao carregar Winning Tasks')
      }finally{
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [])

  useEffect(() => {
    try{
      const raw = localStorage.getItem('prospout_eod_logs')
      const parsed = raw ? JSON.parse(raw) : {}
      setEodLogs(parsed && typeof parsed === 'object' ? parsed : {})
    }catch{}
  }, [])

  function saveEod(){
    const wins = eodWins.split('\n').map(s=>s.trim()).filter(Boolean)
    const issues = eodIssues.split('\n').map(s=>s.trim()).filter(Boolean)
    if (wins.length===0 && issues.length===0) return
    const key = new Date().toISOString().slice(0,10)
    const next = { ...eodLogs, [key]: { wins, issues } }
    setEodLogs(next)
    try{ localStorage.setItem('prospout_eod_logs', JSON.stringify(next)) }catch{}
    setEodWins('')
    setEodIssues('')
  }

  async function claimReward(id: string){
    try{
      await fetch('/api/winning-tasks', { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id, patch: { claimedAt: new Date().toISOString() } }) })
      setItems(items.map(i => i.id===id ? { ...i, claimedAt: new Date().toISOString() } : i))
    }catch{}
  }

  function share(id: string){
    const item = items.find(i=>i.id===id)
    const text = `Conquista: ${item?.title}${item?.reward ? ` — Recompensa: ${item.reward}`:''}`
    const url = window.location.href
    if (navigator.share){ navigator.share({ title: 'Winning Task', text, url }).catch(()=>{}) }
    else { navigator.clipboard.writeText(`${text}\n${url}`).catch(()=>{}) }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Winning Tasks</h1>
        {loading && <div className="text-xs text-slate-400">Carregando…</div>}
        {error && <div className="text-xs text-red-400">{error}</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(i => (
          <article key={i.id} className="group relative" aria-label={i.title}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-slate-700/40 rounded-xl overflow-hidden">
              {i.mediaUrl && <img src={i.mediaUrl} alt="media" className="w-full h-32 object-cover" />}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-100 truncate">{i.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs ${i.completedAt ? 'bg-emerald-600/40 text-emerald-200' : 'bg-amber-600/40 text-amber-200'}`}>{i.completedAt ? 'Concluída' : 'Pendente'}</span>
                </div>
                {i.description && <p className="text-sm text-slate-300 line-clamp-3">{i.description}</p>}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3"/> Criada: {new Date(i.createdAt).toLocaleDateString()}
                  {i.completedAt && (<><CheckCircle2 className="w-3 h-3"/> Concluída: {new Date(i.completedAt).toLocaleDateString()}</>)}
                </div>
                {i.reward && (
                  <div className="flex items-center gap-2 text-sm text-slate-200"><Trophy className="w-4 h-4 text-amber-400"/> Recompensa: {i.reward}</div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <button onClick={()=>share(i.id)} className="px-3 py-2 rounded bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs flex items-center gap-2"><Share2 className="w-4 h-4"/> Compartilhar</button>
                  <button onClick={()=>claimReward(i.id)} disabled={!!i.claimedAt} className={`px-3 py-2 rounded text-xs flex items-center gap-2 ${i.claimedAt ? 'bg-slate-700 text-slate-400' : 'bg-emerald-600 text-white'}`}>
                    <Download className="w-4 h-4"/> {i.claimedAt ? 'Recompensa reivindicada' : 'Reivindicar recompensa'}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="space-y-6">
        <div className="rounded-xl overflow-hidden border border-slate-700/40">
          <div className="px-4 py-3 bg-black text-white font-extrabold">Winning Tasks</div>
          <div className="grid grid-cols-2">
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Winning Tasks</div>
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Details</div>
          </div>
          <div className="divide-y divide-slate-700/40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2">
                <div className="px-4 py-3 bg-slate-900/40"></div>
                <div className="px-4 py-3 bg-slate-900/40"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700/40">
          <div className="px-4 py-3 bg-black text-white font-extrabold">KPIs</div>
          <div className="grid grid-cols-3">
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">KPIs
              <div className="text-xs text-slate-300">(o que é que define o sucesso dessa WT)</div>
            </div>
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Due Date</div>
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Impact</div>
          </div>
          <div className="divide-y divide-slate-700/40">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3">
                <div className="px-4 py-3 bg-slate-900/40"></div>
                <div className="px-4 py-3 bg-slate-900/40"></div>
                <div className="px-4 py-3 bg-slate-900/40"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700/40">
          <div className="px-4 py-3 bg-black text-white font-extrabold">Impact / Ease Level / Overall Score</div>
          <div className="grid grid-cols-3">
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Impact
              <div className="text-xs text-slate-300">10% = low impact, 100% = high impact</div>
            </div>
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Ease Level
              <div className="text-xs text-slate-300">10% = very hard, 100% = extremely easy</div>
            </div>
            <div className="px-4 py-2 bg-slate-800/80 text-slate-100 font-semibold">Overall Score
              <div className="text-xs text-slate-300">weighted: 70% impact, 30% ease</div>
            </div>
          </div>
          <div className="divide-y divide-slate-700/40">
            {scoreRows.map((row, idx) => {
              const score = Math.round((row.impactPct * 0.7 + row.easePct * 0.3))
              return (
                <div key={idx} className="grid grid-cols-3">
                  <div className="px-4 py-3 bg-slate-900/40">
                    <input type="number" min={10} max={100} step={10} value={row.impactPct} onChange={e=>{
                      const v = Math.max(10, Math.min(100, Number(e.target.value)||0))
                      const next = scoreRows.slice(); next[idx] = { ...row, impactPct: v }; setScoreRows(next)
                    }} className="w-24 p-2 bg-slate-800/60 border border-slate-700/50 rounded text-slate-100" />
                  </div>
                  <div className="px-4 py-3 bg-slate-900/40">
                    <input type="number" min={10} max={100} step={10} value={row.easePct} onChange={e=>{
                      const v = Math.max(10, Math.min(100, Number(e.target.value)||0))
                      const next = scoreRows.slice(); next[idx] = { ...row, easePct: v }; setScoreRows(next)
                    }} className="w-24 p-2 bg-slate-800/60 border border-slate-700/50 rounded text-slate-100" />
                  </div>
                  <div className="px-4 py-3 bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-3 rounded bg-slate-700">
                        <div className="h-3 rounded bg-violet-500" style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-sm text-slate-200">{score}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500/20 to-slate-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-xl font-extrabold text-slate-100 mb-4">End Of Month Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TableBlock title="Objetivos do mês" />
              <TableBlock title="Resumo do Mês" />
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500/20 to-slate-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-xl font-extrabold text-slate-100 mb-4">Avoiding Failure & Mechanisms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TableBlock title="Failure Scenario" />
              <TableBlock title="Mechanism to Avoid Failure" />
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700/40">
          <div className="px-4 py-3 bg-black text-white font-extrabold">KPI Grid</div>
          <div className="grid grid-cols-5">
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Productivity (0 - 5)</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Total Appointments</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Total calls</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Chamadas atendidas</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Responsáveis</div>
          </div>
          <div className="divide-y divide-slate-700/40">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-5">
                {[...Array(5)].map((__,j)=> (
                  <div key={j} className="px-3 py-3 bg-slate-900/40"></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700/40">
          <div className="px-4 py-3 bg-black text-white font-extrabold">End-Of-Day Report</div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-700/40">
            <div>
              <div className="text-xs text-slate-400 mb-1">Wins (+)</div>
              <textarea value={eodWins} onChange={e=>setEodWins(e.target.value)} placeholder="One per line" className="w-full h-24 p-2 bg-slate-900/40 border border-slate-700/40 rounded text-sm text-slate-100" />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Issues (-)</div>
              <textarea value={eodIssues} onChange={e=>setEodIssues(e.target.value)} placeholder="One per line" className="w-full h-24 p-2 bg-slate-900/40 border border-slate-700/40 rounded text-sm text-slate-100" />
            </div>
            <div className="flex items-end">
              <button onClick={saveEod} className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded text-sm">Save</button>
            </div>
          </div>
          <div className="grid grid-cols-[80px_1fr_1fr_1fr]">
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold flex items-center justify-center rotate-[-90deg] origin-center">janeiro</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Resumo do Dia</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Obstáculos</div>
            <div className="px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold">Soluções</div>
          </div>
          <div className="divide-y divide-slate-700/40">
            {Array.from({ length: 7 }).map((_, idx) => {
              const todayIdx = new Date().getDay()
              const key = new Date().toISOString().slice(0,10)
              const log = eodLogs[key]
              const show = idx === todayIdx
              return (
                <div key={idx} className="grid grid-cols-[80px_1fr_1fr_1fr]">
                  <div className="px-3 py-3 bg-slate-900/40 text-slate-300 flex items-center justify-center">{idx+1}</div>
                  <div className="px-3 py-3 bg-slate-900/40 text-slate-200 text-sm whitespace-pre-wrap">{show && log ? log.wins.map(w=>`• ${w}`).join('\n') : ''}</div>
                  <div className="px-3 py-3 bg-slate-900/40 text-slate-200 text-sm whitespace-pre-wrap">{show && log ? log.issues.map(w=>`• ${w}`).join('\n') : ''}</div>
                  <div className="px-3 py-3 bg-slate-900/40"></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function TableBlock({ title }: { title: string }){
  return (
    <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 min-h-[180px]">
      <div className="px-3 py-2 bg-slate-800/60 text-slate-200 font-semibold text-sm">{title}</div>
      <div className="h-[140px]"></div>
    </div>
  )
}

function HeaderCell({ children }: { children: React.ReactNode }){
  return <div className="px-3 py-2 bg-slate-800/60 text-slate-200 font-semibold rounded">{children}</div>
}

function Cell(){
  return <div className="px-3 py-2 bg-slate-900/40 border border-slate-700/40 rounded"></div>
}
