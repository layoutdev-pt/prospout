import { NextResponse } from 'next/server';
import memory from '../../../lib/memoryStore';

function safeDiv(a = 0, b = 1) { return b === 0 ? 0 : a / b; }

function parseDate(d?: string) {
  if (!d) return undefined;
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return undefined;
  return t;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pipeline = url.searchParams.get('pipeline') as any;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;

  const activities = memory.listActivities({ pipeline: pipeline || undefined, from, to });
  const deals = memory.listDeals({ pipeline: pipeline || undefined });

  // Totals
  const totals = activities.reduce((s, a) => {
    s.totalCalls += a.coldCallsMade || 0;
    s.coldCallsAnswered += a.coldCallsAnswered || 0;
    s.r1ViaCall += a.r1ViaCall || 0;
    s.coldDmsSent += a.coldDmsSent || 0;
    s.coldDmsReplied += a.coldDmsReplied || 0;
    s.meetsViaDm += a.meetsViaDm || 0;
    s.emailsSent += a.emailsSent || 0;
    s.emailsOpened += a.emailsOpened || 0;
    s.emailsReplied += a.emailsReplied || 0;
    s.meetsViaEmail += a.meetsViaEmail || 0;

    s.r1Completed += a.r1Completed || 0;
    s.r2Scheduled += a.r2Scheduled || 0;
    s.r2Completed += a.r2Completed || 0;
    s.r3Scheduled += a.r3Scheduled || 0;
    s.r3Completed += a.r3Completed || 0;

    s.verbalAgreements += a.verbalAgreements || 0;
    s.dealsClosedFromActivities += a.dealsClosed || 0;

    return s;
  }, {
    totalCalls: 0,
    coldCallsAnswered: 0,
    r1ViaCall: 0,
    coldDmsSent: 0,
    coldDmsReplied: 0,
    meetsViaDm: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsReplied: 0,
    meetsViaEmail: 0,

    r1Completed: 0,
    r2Scheduled: 0,
    r2Completed: 0,
    r3Scheduled: 0,
    r3Completed: 0,

    verbalAgreements: 0,
    dealsClosedFromActivities: 0,
  } as any);

  // Compute deals info (closed deals in deals array)
  const closedDeals = deals.filter(d => d.closedAt);
  // compute avgTimeToCashDays from deals that have timeToCashDays or compute from createdAt/closedAt
  const dealTimeDays = closedDeals.map(d => {
    if (typeof d.timeToCashDays === 'number') return d.timeToCashDays;
    if (d.closedAt && d.createdAt) {
      const diff = (new Date(d.closedAt).getTime() - new Date(d.createdAt).getTime()) / (1000*60*60*24);
      return Math.round(diff * 10) / 10;
    }
    return undefined;
  }).filter(x => typeof x === 'number') as number[];

  const avgTimeToCashDays = dealTimeDays.length > 0 ? Math.round((dealTimeDays.reduce((s, v) => s + v, 0) / dealTimeDays.length) * 10) / 10 : null;

  const totalDeals = closedDeals.length + (totals.dealsClosedFromActivities || 0);

  // Helper derived counts
  const totalR1Scheduled = (totals.r1ViaCall || 0) + (totals.meetsViaDm || 0) + (totals.meetsViaEmail || 0);

  // Essential rate KPIs (as percentages 0-100)
  const pctCallsAnswered = Math.round(safeDiv(totals.coldCallsAnswered, totals.totalCalls) * 1000) / 10;
  const pctR1ViaCall = Math.round(safeDiv(totals.r1ViaCall, totals.totalCalls) * 1000) / 10;
  const pctDmResponse = Math.round(safeDiv(totals.coldDmsReplied, totals.coldDmsSent) * 1000) / 10;
  const pctR1ViaDm = Math.round(safeDiv(totals.meetsViaDm, totals.coldDmsReplied) * 1000) / 10;
  const pctEmailReply = Math.round(safeDiv(totals.emailsReplied, totals.emailsSent) * 1000) / 10;
  const pctR1ShowRate = Math.round(safeDiv(totals.r1Completed, totalR1Scheduled) * 1000) / 10;
  const pctR2ShowRate = Math.round(safeDiv(totals.r2Completed, totals.r2Scheduled) * 1000) / 10;
  const pctR3ShowRate = Math.round(safeDiv(totals.r3Completed, totals.r3Scheduled) * 1000) / 10;

  // Conversion to close rates
  const pctR1ToClose = Math.round(safeDiv(totalDeals, totals.r1Completed) * 1000) / 10;
  const pctR2ToClose = Math.round(safeDiv(totalDeals, totals.r2Completed) * 1000) / 10;
  const pctR3ToClose = Math.round(safeDiv(totalDeals, totals.r3Completed) * 1000) / 10;

  // Conversion to verbal agreement
  const pctR1ToVerbal = Math.round(safeDiv(totals.verbalAgreements, totals.r1Completed) * 1000) / 10;
  const pctR2ToVerbal = Math.round(safeDiv(totals.verbalAgreements, totals.r2Completed) * 1000) / 10;
  const pctR3ToVerbal = Math.round(safeDiv(totals.verbalAgreements, totals.r3Completed) * 1000) / 10;

  // Pipeline-to-pipeline conversions
  const pctR1ToR2 = Math.round(safeDiv(totals.r2Scheduled, totals.r1Completed) * 1000) / 10;
  const pctR2ToR3 = Math.round(safeDiv(totals.r3Scheduled, totals.r2Completed) * 1000) / 10;

  // Prepare time series (daily aggregation) for the range requested (default last 30 days)
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 29);
  // normalize times to midnight
  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);

  const days: any[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0,10);
    days.push({ date: key, calls: 0, callsAnswered: 0, r1Scheduled: 0, r1Completed: 0, dealsClosed: 0 });
    cur.setDate(cur.getDate() + 1);
  }

  const dayMap = new Map(days.map(d=>[d.date,d]));

  activities.forEach(a => {
    const key = (a.date || a.createdAt).slice(0,10);
    const row = dayMap.get(key);
    if (!row) return;
    row.calls += a.coldCallsMade || 0;
    row.callsAnswered += a.coldCallsAnswered || 0;
    row.r1Scheduled += (a.r1ViaCall || 0) + (a.meetsViaDm || 0) + (a.meetsViaEmail || 0);
    row.r1Completed += a.r1Completed || 0;
  });

  closedDeals.forEach(d => {
    if (!d.closedAt) return;
    const key = d.closedAt.slice(0,10);
    const row = dayMap.get(key);
    if (!row) return;
    row.dealsClosed += 1;
  });

  const timeSeries = Array.from(dayMap.values());

  const response = {
    totals,
    totalDeals,
    avgTimeToCashDays,

    // percentages
    pctCallsAnswered,
    pctR1ViaCall,
    pctDmResponse,
    pctR1ViaDm,
    pctEmailReply,
    pctR1ShowRate,
    pctR2ShowRate,
    pctR3ShowRate,

    pctR1ToClose,
    pctR2ToClose,
    pctR3ToClose,

    pctR1ToVerbal,
    pctR2ToVerbal,
    pctR3ToVerbal,

    pctR1ToR2,
    pctR2ToR3,

    timeSeries,
  };

  return NextResponse.json(response);
}
