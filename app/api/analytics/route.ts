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
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;

  const analyticsData = await prospout.getAnalytics({
    pipeline: pipeline || undefined,
    from,
    to,
    userId: user.id,
  });

  return NextResponse.json(analyticsData);
}
