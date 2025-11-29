"use client";
import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Wand2, Printer, Download, Upload, Clock, SlidersHorizontal, ArrowRightLeft } from 'lucide-react'
import ContentAnalyticsDashboard from '@/components/ContentAnalyticsDashboard'

type ContentType = 'short' | 'long' | 'story' | 'post' | 'carousel'

type Resource = {
  camera: boolean
  editor: boolean
  tripod: boolean
  lighting: boolean
  designer: boolean
}

type PlanItem = {
  id: string
  title: string
  type: ContentType
  minutes: number
  resources: Resource
  priority: number
  scheduledAt?: string
  platform?: string
  status?: 'planned' | 'scheduled' | 'done'
}

type ScheduleSlot = {
  id: string
  startISO: string
  endISO: string
  itemId?: string
}

const CONTENT_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'short', label: 'Short Form' },
  { value: 'long', label: 'Long Form' },
  { value: 'story', label: 'Stories' },
  { value: 'post', label: 'Posts' },
  { value: 'carousel', label: 'Carousels' },
]

export default function ContentPlanner() {
  const [items, setItems] = useState<PlanItem[]>([])
  const [platform, setPlatform] = useState<'instagram'|'youtube'|'tiktok'|'twitter'>('instagram')
  const [range, setRange] = useState<'week'|'month'|'quarter'>('month')
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<ContentType>('short')
  const [newMinutes, setNewMinutes] = useState(60)
  const [resources, setResources] = useState<Resource>({ camera: true, editor: true, tripod: true, lighting: false, designer: false })
  const [priority, setPriority] = useState(3)
  const [slots, setSlots] = useState<ScheduleSlot[]>(generateInitialSlots())
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const timelineByDay = useMemo(() => groupSlotsByDay(slots, items), [slots, items])

  const addItem = () => {
    if (!newTitle.trim()) return
    const id = Math.random().toString(36).slice(2)
    const item: PlanItem = {
      id,
      title: newTitle.trim(),
      type: newType,
      minutes: newMinutes,
      resources,
      priority,
      status: 'planned',
    }
    setItems((prev) => [item, ...prev])
    setNewTitle('')
  }

  const autoSchedule = async () => {
    if (items.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/content-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, slots })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const updatedSlots: ScheduleSlot[] = slots.map((s) => {
        const assigned = data.assignments?.find((a: any) => a.slotId === s.id)
        return assigned ? { ...s, itemId: assigned.itemId } : { ...s, itemId: s.itemId }
      })
      const updatedItems: PlanItem[] = items.map((it) => {
        const assigned = data.assignments?.find((a: any) => a.itemId === it.id)
        return assigned ? { ...it, scheduledAt: assigned.startISO, status: 'scheduled' } : it
      })
      setSlots(updatedSlots)
      setItems(updatedItems)
      setAdvice(data.advice || '')
    } catch (e) {
      alert('Failed to auto-schedule')
    } finally {
      setLoading(false)
    }
  }

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
  }

  const onDropItem = (e: React.DragEvent, slotId: string) => {
    const itemId = e.dataTransfer.getData('text/plain')
    setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, itemId } : s))
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'scheduled' } : it))
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ items, slots }, null, 2)], { type: 'application/json' })
    downloadBlob(blob, 'content-plan.json')
  }

  const exportICS = () => {
    const lines: string[] = []
    lines.push('BEGIN:VCALENDAR')
    lines.push('VERSION:2.0')
    lines.push('PRODID:-//Prospout//Content Planner//EN')
    slots.filter(s => s.itemId).forEach(s => {
      const item = items.find(i => i.id === s.itemId)
      if (!item) return
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${s.id}@prospout`)
      lines.push(`DTSTART:${toICS(s.startISO)}`)
      lines.push(`DTEND:${toICS(s.endISO)}`)
      lines.push(`SUMMARY:${item.title}`)
      lines.push('END:VEVENT')
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\n')], { type: 'text/calendar' })
    downloadBlob(blob, 'content-schedule.ics')
  }

  const printSchedule = () => {
    window.print()
  }

  const resourceReport = () => {
    const totals = items.reduce((acc: any, it) => {
      acc.minutes += it.minutes
      acc.camera += it.resources.camera ? 1 : 0
      acc.editor += it.resources.editor ? 1 : 0
      acc.tripod += it.resources.tripod ? 1 : 0
      acc.lighting += it.resources.lighting ? 1 : 0
      acc.designer += it.resources.designer ? 1 : 0
      return acc
    }, { minutes: 0, camera: 0, editor: 0, tripod: 0, lighting: 0, designer: 0 })
    const text = `Total Minutes: ${totals.minutes}\nCamera: ${totals.camera}\nEditor: ${totals.editor}\nTripod: ${totals.tripod}\nLighting: ${totals.lighting}\nDesigner: ${totals.designer}`
    const blob = new Blob([text], { type: 'text/plain' })
    downloadBlob(blob, 'resources.txt')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-white">
      <div className="mb-6 card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Analytics Overview</h2>
            <p className="text-xs text-slate-400">Integrated content analytics inside the planner</p>
          </div>
          <div className="flex gap-2">
            <select value={platform} onChange={(e)=>setPlatform(e.target.value as any)} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm">
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter</option>
            </select>
            <select value={range} onChange={(e)=>setRange(e.target.value as any)} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm">
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>
        </div>
        <ContentAnalyticsDashboard platform={platform} fromISO={computeFrom(range)} toISO={new Date().toISOString()} autoRefresh={false} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">Content Planner</h1>
          <p className="text-slate-400 text-sm">Plan, schedule, and optimize content with AI</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printSchedule} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm flex items-center gap-2"><Printer className="w-4 h-4"/>Print</button>
          <button onClick={exportJSON} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm flex items-center gap-2"><Download className="w-4 h-4"/>JSON</button>
          <button onClick={exportICS} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm flex items-center gap-2"><Download className="w-4 h-4"/>Calendar</button>
          <button onClick={resourceReport} className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm flex items-center gap-2"><Download className="w-4 h-4"/>Resources</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/>Content Planning</h2>
            <div className="space-y-3">
              <input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="Title" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"/>
              <select value={newType} onChange={(e)=>setNewType(e.target.value as ContentType)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                {CONTENT_OPTIONS.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4"/>
                <input type="number" value={newMinutes} min={15} max={240} onChange={(e)=>setNewMinutes(parseInt(e.target.value||'0'))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"/>
                <span className="text-xs text-slate-400">minutes</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.keys(resources).map((k)=>{
                  const key = k as keyof Resource
                  return (
                    <label key={k} className="flex items-center gap-2 bg-slate-800/40 p-2 rounded">
                      <input type="checkbox" checked={resources[key]} onChange={(e)=>setResources(prev=>({ ...prev, [key]: e.target.checked }))} />
                      <span className="capitalize">{k}</span>
                    </label>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={5} value={priority} onChange={(e)=>setPriority(parseInt(e.target.value))} className="w-full"/>
                <span className="text-xs">Priority {priority}</span>
              </div>
              <button onClick={addItem} className="w-full px-3 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Add Item</button>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wand2 className="w-4 h-4"/>AI Advisory</h2>
            <button onClick={autoSchedule} disabled={loading} className="w-full px-3 py-2 bg-cyan-600 rounded-lg text-sm font-semibold disabled:opacity-50">{loading? 'Scheduling…' : 'Auto-Schedule'}</button>
            {advice && <div className="mt-3 text-sm text-slate-300 whitespace-pre-line">{advice}</div>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4"/>Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {timelineByDay.map((day)=> (
                <div key={day.date} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-2">
                  <div className="text-xs text-slate-400 mb-2">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="space-y-2">
                    {day.slots.map(slot => (
                      <div key={slot.id} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDropItem(e, slot.id)} className="p-2 rounded bg-slate-800/50 border border-slate-700/40 min-h-[44px]">
                        {slot.itemId ? (
                          <div className="text-xs text-cyan-300">{items.find(i=>i.id===slot.itemId)?.title}</div>
                        ) : (
                          <div className="text-[10px] text-slate-500">{formatTime(slot.startISO)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4"/>Production Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-2">Planned</div>
                <div className="space-y-2">
                  {items.filter(i=>i.status==='planned').map(it => (
                    <div key={it.id} draggable onDragStart={(e)=>onDragStart(e, it.id)} className="p-2 bg-slate-800/50 border border-slate-700/40 rounded text-xs">
                      {it.title}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-2">Scheduled</div>
                <div className="space-y-2">
                  {items.filter(i=>i.status==='scheduled').map(it => (
                    <div key={it.id} className="p-2 bg-slate-800/50 border border-slate-700/40 rounded text-xs">
                      {it.title}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-2">Done</div>
                <div className="space-y-2">
                  {items.filter(i=>i.status==='done').map(it => (
                    <div key={it.id} className="p-2 bg-slate-800/50 border border-slate-700/40 rounded text-xs">
                      {it.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateInitialSlots(): ScheduleSlot[] {
  const now = new Date()
  const start = new Date(now)
  start.setHours(8,0,0,0)
  const slots: ScheduleSlot[] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 8; h <= 20; h += 2) {
      const s = new Date(now)
      s.setDate(now.getDate()+d)
      s.setHours(h,0,0,0)
      const e = new Date(s)
      e.setHours(h+2)
      slots.push({ id: `${d}-${h}`, startISO: s.toISOString(), endISO: e.toISOString() })
    }
  }
  return slots
}

function groupSlotsByDay(slots: ScheduleSlot[], items: PlanItem[]) {
  const days: { date: string; slots: ScheduleSlot[] }[] = []
  const grouped: Record<string, ScheduleSlot[]> = {}
  slots.forEach(s => {
    const key = s.startISO.slice(0,10)
    grouped[key] = grouped[key] || []
    grouped[key].push(s)
  })
  Object.keys(grouped).forEach(k => {
    days.push({ date: k, slots: grouped[k] })
  })
  return days
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2,'0')}:00`
}

function toICS(iso: string) {
  const d = new Date(iso)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth()+1).padStart(2,'0')
  const dd = String(d.getUTCDate()).padStart(2,'0')
  const hh = String(d.getUTCHours()).padStart(2,'0')
  const mi = String(d.getUTCMinutes()).padStart(2,'0')
  const ss = String(d.getUTCSeconds()).padStart(2,'0')
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function computeFrom(range: 'week'|'month'|'quarter') {
  const now = new Date()
  const d = new Date(now)
  if (range === 'week') d.setDate(now.getDate() - 7)
  if (range === 'month') d.setDate(now.getDate() - 30)
  if (range === 'quarter') d.setDate(now.getDate() - 90)
  return d.toISOString()
}
