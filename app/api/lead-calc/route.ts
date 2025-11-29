import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'
import leadCalcStore from '@/lib/leadCalcStore'

export async function GET(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const url = new URL(req.url)
  const pipeline = url.searchParams.get('pipeline') as 'COMPANIES' | 'INFLUENCERS' | undefined

  const list = leadCalcStore.list({ userId: user.id, pipeline })
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await req.json()
  const saved = leadCalcStore.add({
    userId: user.id,
    pipeline: body.pipeline,
    contactsPerDeal: body.contactsPerDeal,
    inputs: body.inputs,
  })
  return NextResponse.json(saved)
}

