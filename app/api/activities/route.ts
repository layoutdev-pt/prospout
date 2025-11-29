import { NextResponse } from 'next/server';
import prospout from '../../../lib/prospoutService';
import { cookies } from 'next/headers';
import { createRouteClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(req.url);
  const pipeline = url.searchParams.get('pipeline') as 'COMPANIES' | 'INFLUENCERS' | null;
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const list = await prospout.listActivities({ userId: user.id, pipeline: pipeline || undefined, from: from || undefined, to: to || undefined });
  return NextResponse.json({ activities: list });
}

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const payload = await req.json();
  const created = await prospout.addActivity({
    pipeline: payload.pipeline || 'COMPANIES',
    date: payload.date ? new Date(payload.date) : new Date(),
    coldCallsMade: payload.coldCallsMade || 0,
    coldCallsAnswered: payload.coldCallsAnswered || 0,
    r1ViaCall: payload.r1ViaCall || 0,
    coldDmsSent: payload.coldDmsSent || 0,
    coldDmsReplied: payload.coldDmsReplied || 0,
    meetsViaDm: payload.meetsViaDm || 0,
    emailsSent: payload.emailsSent || 0,
    emailsOpened: payload.emailsOpened || 0,
    meetsViaEmail: payload.meetsViaEmail || 0,
    r1Completed: payload.r1Completed || 0,
    r2Scheduled: payload.r2Scheduled || 0,
    r2Completed: payload.r2Completed || 0,
    r3Scheduled: payload.r3Scheduled || 0,
    r3Completed: payload.r3Completed || 0,
    verbalAgreements: payload.verbalAgreements || 0,
    dealsClosed: payload.dealsClosed || 0,
  }, user.id);

  // Optionally create deal records if provided with details
  if (payload.deals && Array.isArray(payload.deals)) {
    for (const d of payload.deals) {
      await prospout.addDeal({
        pipeline: d.pipeline || payload.pipeline || 'COMPANIES',
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        closedAt: d.closedAt ? new Date(d.closedAt) : undefined,
        verbalAgreement: d.verbalAgreement,
        value: d.value,
      }, user.id);
    }
  }

  return NextResponse.json({ created });
}
