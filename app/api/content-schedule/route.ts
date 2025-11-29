import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'
import { generateContentAdvisory } from '@/lib/googleAI'

type PlanItem = {
  id: string
  title: string
  type: string
  minutes: number
  priority: number
}

type Slot = { id: string; startISO: string; endISO: string }

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await req.json()
  const items: PlanItem[] = Array.isArray(body.items) ? body.items : []
  const slots: Slot[] = Array.isArray(body.slots) ? body.slots : []

  const sortedItems = items.slice().sort((a,b)=> b.priority - a.priority)
  const assignments: Array<{ slotId: string; itemId: string; startISO: string }> = []

  const weekendPref = (iso: string) => {
    const d = new Date(iso)
    const day = d.getDay()
    return day === 0 || day === 6
  }

  const peakHours = (iso: string) => {
    const h = new Date(iso).getHours()
    return h >= 18 || h <= 10
  }

  const freeSlots = slots.slice().sort((a,b)=>{
    const aw = weekendPref(a.startISO) ? -1 : 0
    const bw = weekendPref(b.startISO) ? -1 : 0
    const ap = peakHours(a.startISO) ? -1 : 0
    const bp = peakHours(b.startISO) ? -1 : 0
    return (aw+ap) - (bw+bp)
  })

  const used = new Set<string>()
  for (const it of sortedItems) {
    const slot = freeSlots.find(s => !used.has(s.id))
    if (slot) {
      assignments.push({ slotId: slot.id, itemId: it.id, startISO: slot.startISO })
      used.add(slot.id)
    }
  }

  let advice: string | null = null
  try {
    advice = await generateContentAdvisory({ items: sortedItems, assignments })
  } catch {
    advice = null
  }

  return NextResponse.json({ assignments, advice })
}

