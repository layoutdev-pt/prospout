import { NextResponse } from 'next/server'
import memory from '@/lib/memoryStore'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const from = url.searchParams.get('from') || undefined
  const to = url.searchParams.get('to') || undefined
  const finance = memory.listFinance({ from, to })
  const revenue = finance.filter(f => f.type === 'REVENUE').reduce((s, f) => s + (f.amount || 0), 0)
  const expenses = finance.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + (f.amount || 0), 0)
  const profit = revenue - expenses
  const byMonth: Record<string, { revenue: number; expenses: number; profit: number }> = {}
  for (const f of finance) {
    const key = (f.date).slice(0,7)
    byMonth[key] = byMonth[key] || { revenue: 0, expenses: 0, profit: 0 }
    if (f.type === 'REVENUE') byMonth[key].revenue += f.amount || 0
    else byMonth[key].expenses += f.amount || 0
    byMonth[key].profit = byMonth[key].revenue - byMonth[key].expenses
  }

  const series = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).map(([m,v])=>({ period: m, revenue: v.revenue, expenses: v.expenses, profit: v.profit }))

  return NextResponse.json({ revenue, expenses, profit, series })
}

export async function POST(req: Request) {
  const body = await req.json()
  const item = memory.addFinanceEntry({
    userId: body.userId,
    date: body.date,
    type: body.type,
    category: body.category,
    amount: Number(body.amount || 0),
    description: body.description,
  })
  return NextResponse.json(item)
}
