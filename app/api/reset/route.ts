import { NextResponse } from 'next/server';
import prospout from '../../../lib/prospoutService';
import { cookies } from 'next/headers';
import { createRouteClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // reset database
  await prospout.reset();
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  // provide a quick status of database table sizes
  const activities = await prospout.listActivities({ userId: user.id });
  const deals = await prospout.listDeals({ userId: user.id });
  return NextResponse.json({ activities: activities.length, deals: deals.length });
}
