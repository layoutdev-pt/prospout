import { NextResponse } from 'next/server';
import memory from '../../../lib/memoryStore';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pipeline = url.searchParams.get('pipeline');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const list = memory.listActivities({ pipeline: pipeline as any || undefined, from: from || undefined, to: to || undefined });
  return NextResponse.json({ activities: list });
}

export async function POST(req: Request) {
  const payload = await req.json();
  const created = memory.addActivity({
    userId: payload.userId || 'anon',
    date: payload.date || new Date().toISOString(),
    pipeline: payload.pipeline || 'COMPANIES',

    coldCallsMade: payload.coldCallsMade || 0,
    coldCallsAnswered: payload.coldCallsAnswered || 0,
    r1ViaCall: payload.r1ViaCall || 0,

    coldDmsSent: payload.coldDmsSent || 0,
    coldDmsReplied: payload.coldDmsReplied || 0,
    meetsViaDm: payload.meetsViaDm || 0,

    emailsSent: payload.emailsSent || 0,
    emailsOpened: payload.emailsOpened || 0,
    emailsReplied: payload.emailsReplied || 0,
    meetsViaEmail: payload.meetsViaEmail || 0,

    r1Completed: payload.r1Completed || 0,
    r2Scheduled: payload.r2Scheduled || 0,
    r2Completed: payload.r2Completed || 0,
    r3Scheduled: payload.r3Scheduled || 0,
    r3Completed: payload.r3Completed || 0,

    verbalAgreements: payload.verbalAgreements || 0,
    dealsClosed: payload.dealsClosed || 0,
    avgTimeToCashDays: payload.avgTimeToCashDays || undefined,
  });

  // Optionally create deal records if provided with details
  if (payload.deals && Array.isArray(payload.deals)) {
    for (const d of payload.deals) {
      memory.addDeal({
        userId: d.userId || 'anon',
        pipeline: d.pipeline || payload.pipeline || 'COMPANIES',
        createdAt: d.createdAt,
        closedAt: d.closedAt,
        verbalAgreement: d.verbalAgreement,
        value: d.value,
        timeToCashDays: d.timeToCashDays,
      });
    }
  }

  return NextResponse.json({ created });
}
