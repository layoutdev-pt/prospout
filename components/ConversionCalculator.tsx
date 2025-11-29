"use client";
import { useEffect, useMemo, useState } from 'react'
import { Calculator, LineChart as LineChartIcon } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

type Session = {
  id: string
  createdISO: string
  contactsPerDeal: number
}

function saveLocal(sessions: Session[], key: string) {
  try { localStorage.setItem(key, JSON.stringify(sessions)) } catch {}
}
function loadLocal(key: string): Session[] {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

export default function ConversionCalculator({ pipeline }: { pipeline?: 'COMPANIES' | 'INFLUENCERS' }) {
  const [open, setOpen] = useState(false)
  const [contacts, setContacts] = useState<number>(0)
  const [followUps, setFollowUps] = useState<number>(0)
  const [qualified, setQualified] = useState<number>(0)
  const [closed, setClosed] = useState<number>(0)
  const [error, setError] = useState<string| null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [range, setRange] = useState<'week'|'month'|'quarter'>('month')
  const [prefilling, setPrefilling] = useState(false)

  const storageKey = useMemo(() => `conv_sessions_${pipeline || 'ALL'}`, [pipeline])

  useEffect(() => { setSessions(loadLocal(storageKey)) }, [storageKey])

  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        setPrefilling(true)
        const params = new URLSearchParams()
        if (pipeline) params.set('pipeline', pipeline)
        const res = await fetch(`/api/analytics?${params.toString()}`)
        const a = await res.json()
        const totals = a.totals || {}
        const initialContacts = (totals.totalCalls || 0) + (totals.coldDmsSent || 0) + (totals.emailsSent || 0)
        const follow = (totals.coldDmsReplied || 0) + (totals.emailsOpened || 0)
        const qual = (totals.r1Completed || 0)
        const won = a.totalDeals || 0
        setContacts(initialContacts)
        setFollowUps(follow)
        setQualified(qual)
        setClosed(won)
      } catch (e) {
        const msg = String(e || '')
        if (msg.includes('Abort') || msg.includes('aborted')) {
          // ignore dev-time aborts
        }
      }
      finally { setPrefilling(false) }
    })()
  }, [open, pipeline])

  const calculate = async () => {
    setError(null)
    const totalContacts = contacts + followUps
    if (totalContacts <= 0 || closed <= 0) {
      setError('Enter valid numbers: total contacts > 0 and closed deals > 0')
      return
    }
    const ratio = Math.round((totalContacts / closed) * 100) / 100
    const session: Session = { id: Math.random().toString(36).slice(2), createdISO: new Date().toISOString(), contactsPerDeal: ratio }
    const updated = [...sessions, session]
    setSessions(updated)
    saveLocal(updated, storageKey)
    try {
      await fetch('/api/lead-calc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pipeline, contactsPerDeal: ratio, inputs: { answeredRate: 0, r1Rate: 0, r2Rate: 0, r3Rate: 0, closeRate: 0 } }) })
    } catch {}
    setOpen(false)
  }

  const filteredData = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now)
    if (range === 'week') cutoff.setDate(now.getDate() - 7)
    if (range === 'month') cutoff.setDate(now.getDate() - 30)
    if (range === 'quarter') cutoff.setDate(now.getDate() - 90)
    return sessions.filter(s => new Date(s.createdISO) >= cutoff).map(s => ({ date: s.createdISO.slice(0,10), ratio: s.contactsPerDeal }))
  }, [sessions, range])

  const dotColor = (index: number) => {
    if (index === 0) return '#22d3ee'
    const prev = filteredData[index-1]?.ratio || filteredData[index]?.ratio
    const curr = filteredData[index]?.ratio
    return curr <= prev ? '#10b981' : '#ef4444'
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Calculator className="w-4 h-4"/> Calculate Conversion
        </div>
        <button onClick={()=>setOpen(true)} className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-sm font-semibold">Calculate</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md card p-6">
            <div className="text-lg font-semibold mb-2">Lead Conversion Calculator</div>
            <p className="text-xs text-slate-400 mb-3">Enter counts for this period. Tooltips explain each metric.</p>
            {prefilling && <div className="text-xs text-slate-400 mb-2">Prefilling from analytics…</div>}
            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs">
                <span className="text-slate-400">Initial Contacts</span>
                <input type="number" min={0} value={contacts} onChange={(e)=>setContacts(parseInt(e.target.value||'0'))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" title="Cold calls, first DMs, first emails"/>
              </label>
              <label className="text-xs">
                <span className="text-slate-400">Follow-ups</span>
                <input type="number" min={0} value={followUps} onChange={(e)=>setFollowUps(parseInt(e.target.value||'0'))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" title="Second touches, reminders, replies"/>
              </label>
              <label className="text-xs">
                <span className="text-slate-400">Qualified Leads</span>
                <input type="number" min={0} value={qualified} onChange={(e)=>setQualified(parseInt(e.target.value||'0'))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" title="Leads meeting fit criteria"/>
              </label>
              <label className="text-xs">
                <span className="text-slate-400">Closed Deals</span>
                <input type="number" min={0} value={closed} onChange={(e)=>setClosed(parseInt(e.target.value||'0'))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" title="Deals won in the period"/>
              </label>
            </div>
            {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm">Cancel</button>
              <button onClick={calculate} className="px-3 py-2 bg-cyan-600 rounded-lg text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-400"><LineChartIcon className="w-4 h-4"/> Contacts per Deal</div>
          <select value={range} onChange={(e)=>setRange(e.target.value as any)} className="px-2 py-1 bg-slate-800/60 border border-slate-700/50 rounded text-xs">
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
          </select>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{fill:'#94a3b8', fontSize:10}} />
              <YAxis tick={{fill:'#94a3b8', fontSize:10}} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
              <Legend />
              <Line dataKey="ratio" stroke="#22d3ee" dot={(props:any)=>{
                const idx = props.index ?? 0
                const color = dotColor(idx)
                return <circle cx={props.cx} cy={props.cy} r={3} fill={color} stroke={color} />
              }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
