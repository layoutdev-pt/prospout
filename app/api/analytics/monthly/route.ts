import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'
import prospout from '@/lib/prospoutService'

export async function GET(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const url = new URL(req.url)
  const pipeline = url.searchParams.get('pipeline') as 'COMPANIES' | 'INFLUENCERS' | null
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()))

  const months: Array<{ month: string; totals: any; totalDeals: number; avgTimeToCashDays: number|null }> = []

  for (let m = 1; m <= 12; m++) {
    const start = new Date(Date.UTC(year, m-1, 1))
    const end = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999))
    const activities = await prospout.listActivities({ pipeline: pipeline || undefined, from: start.toISOString(), to: end.toISOString(), userId: user.id })
    const deals = await prospout.listDeals({ pipeline: pipeline || undefined, userId: user.id })

    const totals = activities.reduce((s: any, a: any) => {
      s.totalCalls += a.coldCallsMade || 0
      s.coldCallsAnswered += a.coldCallsAnswered || 0
      s.coldDmsSent += a.coldDmsSent || 0
      s.emailsSent += a.emailsSent || 0
      s.r1Completed += a.r1Completed || 0
      s.r2Scheduled += a.r2Scheduled || 0
      s.r3Scheduled += a.r3Scheduled || 0
      s.verbalAgreements += a.verbalAgreements || 0
      s.dealsClosed += a.dealsClosed || 0
      return s
    }, { totalCalls:0, coldCallsAnswered:0, coldDmsSent:0, emailsSent:0, r1Completed:0, r2Scheduled:0, r3Scheduled:0, verbalAgreements:0, dealsClosed:0 })

    const monthKey = `${year}-${String(m).padStart(2,'0')}`
    const monthDeals = deals.filter((d: any) => d.closedAt && (d.closedAt as Date).toISOString().slice(0,7) === monthKey)
    const dealTimeDays = monthDeals.map((d: any) => {
      if (d.closedAt && d.createdAt) {
        const diff = ((d.closedAt as Date).getTime() - (d.createdAt as Date).getTime()) / (1000*60*60*24)
        return Math.round(diff * 10) / 10
      }
      return undefined
    }).filter((x: any) => typeof x === 'number') as number[]
    const avgTimeToCashDays = dealTimeDays.length > 0 ? Math.round((dealTimeDays.reduce((s, v) => s + v, 0) / dealTimeDays.length) * 10) / 10 : null
    const totalDeals = monthDeals.length

    months.push({ month: monthKey, totals, totalDeals, avgTimeToCashDays })
  }

  return NextResponse.json({ year, pipeline: pipeline || 'ALL', months })
}

