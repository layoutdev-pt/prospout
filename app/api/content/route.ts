import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'
import contentStore from '@/lib/contentStore'

export async function GET(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const url = new URL(req.url)
  const from = url.searchParams.get('from') || undefined
  const to = url.searchParams.get('to') || undefined
  const platform = (url.searchParams.get('platform') || undefined) as any

  const items = contentStore.list({ userId: user.id, from, to, platform })
  const aggregates = contentStore.aggregate(items)
  return NextResponse.json({ items, aggregates })
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await req.json()
  const item = contentStore.add({
    userId: user.id,
    dateISO: body.dateISO || new Date().toISOString(),
    platform: body.platform || 'instagram',
    type: body.type || 'video-short',
    durationSec: body.durationSec,
    views: body.views,
    likes: body.likes,
    comments: body.comments,
    shares: body.shares,
    saves: body.saves,
  })
  return NextResponse.json(item)
}
