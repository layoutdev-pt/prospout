import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'
import { scoreContentPerformance } from '@/lib/googleAI'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await req.json()
  const aggregates = body.aggregates
  try {
    const res = await scoreContentPerformance(aggregates)
    return NextResponse.json(res)
  } catch (e) {
    return NextResponse.json({ score: 0, tips: [ 'AI not available. Configure API key.' ] })
  }
}

