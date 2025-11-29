"use client";
import { useEffect, useMemo, useState } from 'react'
import { BarChart2, Gauge as GaugeIcon, Calendar, RefreshCcw, Download, Settings, Users } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Cell } from 'recharts'

type ContentItem = {
  id: string
  userId: string
  dateISO: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter'
  type: 'video-short' | 'video-long' | 'post-single' | 'post-carousel'
  durationSec?: number
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
}

type Aggregates = {
  totals: {
    videos: number
    videosShort: number
    videosLong: number
    posts: number
    postsSingle: number
    postsCarousel: number
    views: number
    likes: number
    comments: number
    shares: number
    saves: number
    durationSec: number
  }
  monthlyViews: Array<{ month: string; views: number }>
}

export default function ContentAnalyticsDashboard({ platform, fromISO, toISO, autoRefresh: auto = false }: { platform?: 'instagram'|'youtube'|'tiktok'|'twitter'; fromISO?: string; toISO?: string; autoRefresh?: boolean }) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [aggs, setAggs] = useState<Aggregates | null>(null)
  const [role, setRole] = useState<'company'|'influencer'|'agency'|'consultant'>('influencer')
  const [aiScore, setAiScore] = useState<number>(0)
  const [tips, setTips] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(auto)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (platform) params.set('platform', platform)
      if (fromISO) params.set('from', fromISO)
      if (toISO) params.set('to', toISO)
      const q = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/content${q}`, { signal })
      const data = await res.json()
      setItems(data.items || [])
      setAggs(data.aggregates || null)
    } catch (e) {
      const msg = String(e || '')
      if (msg.includes('Abort') || msg.includes('aborted')) {
        setError(null)
      } else {
        setError('Failed to load analytics')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ac = new AbortController()
    fetchData(ac.signal)
    return () => ac.abort()
  }, [platform, fromISO, toISO])

  useEffect(() => {
    if (!autoRefresh) return
    let tickAc: AbortController | null = null
    const id = setInterval(() => {
      if (tickAc) tickAc.abort()
      tickAc = new AbortController()
      fetchData(tickAc.signal)
    }, 15000)
    return () => {
      if (tickAc) tickAc.abort()
      clearInterval(id)
    }
  }, [autoRefresh])

  useEffect(() => {
    (async () => {
      if (!aggs) return
      const res = await fetch('/api/content/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aggregates: aggs }) })
      const data = await res.json()
      setAiScore(data.score || 0)
      setTips(data.tips || [])
    })()
  }, [aggs])

  const monthlyData = useMemo(() => {
    return (aggs?.monthlyViews || []).map(m => ({ name: m.month, views: m.views }))
  }, [aggs])

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ items, aggs }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content-analytics.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ['date','platform','type','durationSec','views','likes','comments','shares','saves']
    const rows = items.map(i => [i.dateISO, i.platform, i.type, i.durationSec||'', i.views||'', i.likes||'', i.comments||'', i.shares||'', i.saves||''].join(','))
    const blob = new Blob([headers.join(',')+'\n'+rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content-items.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">Content Analytics</h1>
          <p className="text-slate-400 text-sm">Performance metrics and AI insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportJSON} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm flex items-center gap-2"><Download className="w-4 h-4"/>JSON</button>
          <button onClick={exportCSV} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm flex items-center gap-2"><Download className="w-4 h-4"/>CSV</button>
          <button onClick={()=>setAutoRefresh(v=>!v)} className={`px-3 py-2 ${autoRefresh?'bg-cyan-700':'bg-slate-800/60'} border border-slate-700/50 rounded-lg text-sm flex items-center gap-2`}><RefreshCcw className="w-4 h-4"/>{autoRefresh? 'Auto' : 'Manual'}</button>
          <select value={role} onChange={(e)=>setRole(e.target.value as any)} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm">
            <option value="company">Companies</option>
            <option value="influencer">Influencers</option>
            <option value="agency">Agency Owners</option>
            <option value="consultant">Consultants</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-xs text-slate-400 mb-4">Loading analytics…</div>}
      {error && <div className="text-xs text-red-400 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Videos" value={aggs?.totals.videos ?? 0} subtitle={`Short: ${aggs?.totals.videosShort ?? 0} • Long: ${aggs?.totals.videosLong ?? 0}`} />
        <StatCard title="Posts" value={aggs?.totals.posts ?? 0} subtitle={`Single: ${aggs?.totals.postsSingle ?? 0} • Carousel: ${aggs?.totals.postsCarousel ?? 0}`} />
        <StatCard title="Views" value={aggs?.totals.views ?? 0} subtitle={`Monthly avg: ${Math.round(((aggs?.monthlyViews||[]).reduce((s,v)=>s+v.views,0)/Math.max((aggs?.monthlyViews||[]).length,1))||0)}`} />
        <StatCard title="Engagement" value={(aggs?.totals.likes ?? 0)+(aggs?.totals.comments ?? 0)} subtitle={`Shares: ${aggs?.totals.shares ?? 0} • Saves: ${aggs?.totals.saves ?? 0}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-400 uppercase">Monthly Viewership</div>
            <Calendar className="w-4 h-4 text-slate-500"/>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{fill:'#94a3b8', fontSize:10}} />
                <YAxis tick={{fill:'#94a3b8', fontSize:10}} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="views" fill="#22d3ee" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-400 uppercase mb-2">AI Quality Score</div>
          <div className="text-4xl font-bold text-cyan-300 mb-2">{aiScore}</div>
          <div className="space-y-2">
            {tips.map((t, i) => (
              <div key={i} className="p-2 bg-slate-800/40 border border-slate-700/30 rounded text-sm">{t}</div>
            ))}
            {tips.length === 0 && <div className="text-slate-500 text-sm">No tips available.</div>}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm text-slate-400 uppercase mb-2">ROI Calculator</div>
        <ROICalculator />
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle?: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-400 uppercase">{title}</div>
      <div className="text-3xl font-bold text-white mt-1">{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  )
}

function ROICalculator() {
  const [spend, setSpend] = useState(1000)
  const [revenue, setRevenue] = useState(3000)
  const [impressions, setImpressions] = useState(100000)
  const [ctr, setCtr] = useState(2.5)
  const [convRate, setConvRate] = useState(1.2)

  const roi = useMemo(() => {
    const clicks = impressions * (ctr/100)
    const conversions = clicks * (convRate/100)
    const calcRevenue = revenue || conversions * 50
    const value = Math.round(((calcRevenue - spend) / Math.max(spend,1)) * 100)
    return isFinite(value) ? value : 0
  }, [spend, revenue, impressions, ctr, convRate])

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <Input label="Spend ($)" value={spend} onChange={setSpend} />
      <Input label="Revenue ($)" value={revenue} onChange={setRevenue} />
      <Input label="Impressions" value={impressions} onChange={setImpressions} />
      <Input label="CTR (%)" value={ctr} onChange={setCtr} />
      <Input label="Conv Rate (%)" value={convRate} onChange={setConvRate} />
      <div className="md:col-span-5 mt-2 text-sm">
        ROI: <span className="font-bold text-cyan-300">{roi}%</span>
      </div>
    </div>
  )
}

function Input({ label, value, onChange }: { label: string; value: number; onChange: (n:number)=>void }) {
  return (
    <label className="text-xs">
      <div className="text-slate-400 mb-1">{label}</div>
      <input type="number" value={value} onChange={(e)=>onChange(parseFloat(e.target.value||'0'))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
    </label>
  )
}
