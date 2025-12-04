"use client";
import { useEffect, useMemo, useState } from 'react'
import TimeFilter from '@/components/TimeFilter'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { Download, Printer, DollarSign } from 'lucide-react'

type FinanceSummary = { revenue: number; expenses: number; profit: number }
type FinanceRow = { period: string; revenue: number; expenses: number; profit: number }

export default function ProfitLossDashboard() {
  const [pipeline, setPipeline] = useState<string>('COMPANIES')
  const [from, setFrom] = useState<string | undefined>(undefined)
  const [to, setTo] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<FinanceSummary>({ revenue: 0, expenses: 0, profit: 0 })
  const [rows, setRows] = useState<FinanceRow[]>([])
  const [revClient, setRevClient] = useState('')
  const [revValue, setRevValue] = useState('')
  const [expSoftware, setExpSoftware] = useState('')
  const [expSoftwareValue, setExpSoftwareValue] = useState('')
  const [expStaff, setExpStaff] = useState('')
  const [expStaffValue, setExpStaffValue] = useState('')
  const [expOther, setExpOther] = useState('')
  const [expOtherValue, setExpOtherValue] = useState('')

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (pipeline) params.set('pipeline', pipeline)
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        const res = await fetch(`/api/finance?${params.toString()}`, { signal: ac.signal })
        const data = await res.json()
        setSummary({ revenue: data.revenue || 0, expenses: data.expenses || 0, profit: data.profit || 0 })
        setRows(data.series || [])
      } catch (e) {
        const msg = String(e || '')
        if (msg.includes('Abort') || msg.includes('aborted')) {
          setError(null)
        } else {
          setError('Failed to load finance data')
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [pipeline, from, to])

  async function addRevenue(){
    if (!revClient.trim() || !revValue) return
    await fetch('/api/finance', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ type:'REVENUE', category:'FEES', amount: Number(revValue), description: revClient, date: new Date().toISOString() }) })
    setRevClient(''); setRevValue('')
    const params = new URLSearchParams(); if (pipeline) params.set('pipeline', pipeline); if (from) params.set('from', from); if (to) params.set('to', to)
    const res = await fetch(`/api/finance?${params.toString()}`); const data = await res.json(); setSummary({ revenue: data.revenue||0, expenses: data.expenses||0, profit: data.profit||0 }); setRows(data.series||[])
  }

  async function addExpense(cat: 'SOFTWARE'|'STAFF'|'OTHER', name: string, val: string){
    if (!name.trim() || !val) return
    await fetch('/api/finance', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ type:'EXPENSE', category:cat, amount: Number(val), description: name, date: new Date().toISOString() }) })
    const params = new URLSearchParams(); if (pipeline) params.set('pipeline', pipeline); if (from) params.set('from', from); if (to) params.set('to', to)
    const res = await fetch(`/api/finance?${params.toString()}`); const data = await res.json(); setSummary({ revenue: data.revenue||0, expenses: data.expenses||0, profit: data.profit||0 }); setRows(data.series||[])
  }

  function exportCSV() {
    const headers = ['period,revenue,expenses,profit']
    const lines = rows.map(r => `${r.period},${r.revenue},${r.expenses},${r.profit}`)
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profit-loss.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Profit & Loss</h1>
        <div className="flex gap-2">
          <button aria-label="Export CSV" onClick={exportCSV} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded text-slate-200 flex items-center gap-2"><Download className="w-4 h-4"/>CSV</button>
          <button aria-label="Print PDF" onClick={()=>window.print()} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded text-slate-200 flex items-center gap-2"><Printer className="w-4 h-4"/>PDF</button>
        </div>
      </div>

      <TimeFilter pipeline={pipeline} setPipeline={setPipeline} setFrom={setFrom} setTo={setTo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Metric title="Receitas" value={summary.revenue} color="from-emerald-500 to-emerald-600" />
        <Metric title="Gastos" value={summary.expenses} color="from-red-500 to-red-600" />
        <Metric title="Lucro" value={summary.profit} color="from-cyan-500 to-cyan-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-emerald-950/30 via-slate-800/20 to-slate-900/40 border border-emerald-500/30 rounded-xl p-5">
            <div className="text-lg font-extrabold text-emerald-400">RECEITAS</div>
            <div className="text-xs text-slate-400 mb-2">FEES DE CLIENTES</div>
            <div className="grid grid-cols-12 gap-2">
              <input aria-label="Nome do cliente" value={revClient} onChange={e=>setRevClient(e.target.value)} placeholder="Nome do cliente" className="col-span-7 md:col-span-7 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <input aria-label="Valor" value={revValue} onChange={e=>setRevValue(e.target.value)} placeholder="Valor" type="number" inputMode="decimal" className="col-span-3 md:col-span-3 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <button onClick={addRevenue} className="col-span-2 md:col-span-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium w-full">Adicionar</button>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-red-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-red-950/30 via-slate-800/20 to-slate-900/40 border border-red-500/30 rounded-xl p-5">
            <div className="text-lg font-extrabold text-red-400">GASTOS</div>
            <div className="text-xs text-slate-400 mb-2">SOFTWARE</div>
            <div className="grid grid-cols-12 gap-2">
              <input aria-label="Item" value={expSoftware} onChange={e=>setExpSoftware(e.target.value)} placeholder="Item" className="col-span-7 md:col-span-7 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <input aria-label="Valor" value={expSoftwareValue} onChange={e=>setExpSoftwareValue(e.target.value)} placeholder="Valor" type="number" inputMode="decimal" className="col-span-3 md:col-span-3 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <button onClick={()=>{ addExpense('SOFTWARE', expSoftware, expSoftwareValue); setExpSoftware(''); setExpSoftwareValue(''); }} className="col-span-2 md:col-span-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium w-full">Adicionar</button>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-red-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-red-950/30 via-slate-800/20 to-slate-900/40 border border-red-500/30 rounded-xl p-5">
            <div className="text-xs text-slate-400 mb-2">STAFF</div>
            <div className="grid grid-cols-12 gap-2">
              <input aria-label="Nome" value={expStaff} onChange={e=>setExpStaff(e.target.value)} placeholder="Nome" className="col-span-7 md:col-span-7 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <input aria-label="Valor" value={expStaffValue} onChange={e=>setExpStaffValue(e.target.value)} placeholder="Valor" type="number" inputMode="decimal" className="col-span-3 md:col-span-3 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <button onClick={()=>{ addExpense('STAFF', expStaff, expStaffValue); setExpStaff(''); setExpStaffValue(''); }} className="col-span-2 md:col-span-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium w-full">Adicionar</button>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 to-orange-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative card bg-gradient-to-br from-orange-950/30 via-slate-800/20 to-slate-900/40 border border-orange-500/30 rounded-xl p-5">
            <div className="text-xs text-slate-400 mb-2">OUTROS</div>
            <div className="grid grid-cols-12 gap-2">
              <input aria-label="Item" value={expOther} onChange={e=>setExpOther(e.target.value)} placeholder="Item" className="col-span-7 md:col-span-7 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <input aria-label="Valor" value={expOtherValue} onChange={e=>setExpOtherValue(e.target.value)} placeholder="Valor" type="number" inputMode="decimal" className="col-span-3 md:col-span-3 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 w-full" />
              <button onClick={()=>{ addExpense('OTHER', expOther, expOtherValue); setExpOther(''); setExpOtherValue(''); }} className="col-span-2 md:col-span-2 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium w-full">Adicionar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-300"><DollarSign className="w-4 h-4"/>Revenue vs Profit</div>
            {loading && <div className="text-xs text-slate-400">Loading…</div>}
            {error && <div className="text-xs text-red-400">{error}</div>}
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" tick={{fill:'#94a3b8', fontSize:10}} />
                <YAxis tick={{fill:'#94a3b8', fontSize:10}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#22d3ee" name="Profit" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-cyan-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">Monthly Totals</div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" tick={{fill:'#94a3b8', fontSize:10}} />
                <YAxis tick={{fill:'#94a3b8', fontSize:10}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ title, value, color }: { title: string; value: number; color: string }) {
  const formatted = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0), [value])
  return (
    <div className="group relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-1000`}></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:border-cyan-500/40 transition" aria-label={title}>
        <div className="text-xs text-slate-400">{title}</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{formatted}</div>
      </div>
    </div>
  )
}
