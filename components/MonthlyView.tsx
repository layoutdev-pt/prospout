"use client";
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BarChart3, Calendar as CalendarIcon } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

type Totals = {
  totalCalls: number
  coldCallsAnswered: number
  r1Completed: number
  r2Scheduled: number
  r3Scheduled: number
  verbalAgreements: number
  coldDmsSent: number
  emailsSent: number
  dealsClosed: number
}

type MonthRow = { month: string; totals: Totals; totalDeals: number; avgTimeToCashDays: number|null }

export default function MonthlyView({ pipeline }: { pipeline?: string }) {
  const search = useSearchParams()
  const month = parseInt(search.get('month')||'') || (new Date().getMonth()+1)
  const year = parseInt(search.get('year')||'') || 2026
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [rows, setRows] = useState<MonthRow[]>([])

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('year', String(year))
        if (pipeline && pipeline !== 'ALL') params.set('pipeline', pipeline)
        const res = await fetch(`/api/analytics/monthly?${params.toString()}`, { signal: ac.signal })
        const data = await res.json()
        setRows(data.months || [])
      } catch (e) {
        const msg = String(e || '')
        if (msg.includes('Abort') || msg.includes('aborted')) {
          setError(null)
        } else {
          setError('Failed to load monthly data')
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [pipeline, month, year])

  const selected = useMemo(() => rows.find(r => r.month === `${year}-${String(month).padStart(2,'0')}`), [rows, month, year])
  const chartData = useMemo(() => rows.map(r => ({ name: r.month.slice(5), calls: r.totals.totalCalls||0, r1: r.totals.r1Completed||0, deals: r.totalDeals||0 })), [rows])

  return (
    <div className="space-y-4">
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-300"><CalendarIcon className="w-4 h-4"/>Monthly Results — {year}-{String(month).padStart(2,'0')}</div>
            {loading && <div className="text-xs text-slate-400">Loading…</div>}
            {error && <div className="text-xs text-red-400">{error}</div>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Stat title="Calls" value={selected?.totals.totalCalls||0} color="from-blue-500 to-blue-600" />
            <Stat title="R1 Completed" value={selected?.totals.r1Completed||0} color="from-emerald-500 to-emerald-600" />
            <Stat title="Deals Closed" value={selected?.totalDeals||0} color="from-red-500 to-red-600" />
            <Stat title="Avg Time to Cash (d)" value={selected?.avgTimeToCashDays ?? 0} color="from-orange-500 to-orange-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <Stat title="DMs Sent" value={selected?.totals.coldDmsSent||0} color="from-violet-500 to-violet-600" />
            <Stat title="Emails Sent" value={selected?.totals.emailsSent||0} color="from-orange-500 to-orange-600" />
            <Stat title="Verbal Agreements" value={selected?.totals.verbalAgreements||0} color="from-pink-500 to-pink-600" />
          </div>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-300"><BarChart3 className="w-4 h-4"/>Monthly Trends — {year}</div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{fill:'#94a3b8', fontSize:10}} />
                <YAxis tick={{fill:'#94a3b8', fontSize:10}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="calls" fill="#22d3ee" name="Calls" radius={[4,4,0,0]} />
                <Bar dataKey="r1" fill="#10b981" name="R1 Completed" radius={[4,4,0,0]} />
                <Bar dataKey="deals" fill="#ff6b35" name="Deals" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="group relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-1000`}></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:border-cyan-500/40 transition">
        <div className="text-xs text-slate-400">{title}</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{value}</div>
      </div>
    </div>
  )
}
