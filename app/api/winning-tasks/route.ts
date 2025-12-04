import { NextResponse } from 'next/server'

type Item = {
  id: string;
  title: string;
  description?: string;
  reward?: string;
  mediaUrl?: string;
  createdAt: string;
  completedAt?: string;
  claimedAt?: string;
}

const items: Item[] = [
  {
    id: 'wt-1',
    title: 'Close Q4 Partnership with Acme',
    description: 'Finalize contract terms and get verbal agreement. Prepare onboarding docs.',
    reward: 'Dinner at Bairro Alto',
    mediaUrl: 'https://images.unsplash.com/photo-1529336953121-3bdc31b29826?q=80&w=1200&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wt-2',
    title: 'Publish Case Study on TikTok Growth',
    description: 'Edit video and publish cross-platform case study for lead gen.',
    reward: 'Spa afternoon',
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now()-86400000).toISOString(),
  },
]

export async function GET(){
  return NextResponse.json({ items })
}

export async function POST(req: Request){
  const body = await req.json()
  const item: Item = {
    id: Math.random().toString(36).slice(2),
    title: String(body.title || 'Task'),
    description: body.description || undefined,
    reward: body.reward || undefined,
    mediaUrl: body.mediaUrl || undefined,
    createdAt: new Date().toISOString(),
  }
  items.unshift(item)
  return NextResponse.json(item)
}

export async function PATCH(req: Request){
  const body = await req.json()
  const { id, patch } = body || {}
  const idx = items.findIndex(i=>i.id===id)
  if (idx === -1) return new NextResponse(JSON.stringify({ error:'Not found' }), { status: 404 })
  items[idx] = { ...items[idx], ...patch }
  return NextResponse.json(items[idx])
}

export async function DELETE(req: Request){
  const { id } = await req.json()
  const idx = items.findIndex(i=>i.id===id)
  if (idx === -1) return new NextResponse(JSON.stringify({ error:'Not found' }), { status: 404 })
  const [removed] = items.splice(idx,1)
  return NextResponse.json(removed)
}
