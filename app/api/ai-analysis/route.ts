import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteClient } from '@/lib/supabase/server';
import { analyzeSalesInput, generateActivityInsights } from '@/lib/googleAI';

function fallbackAnalyze(text: string) {
  const t = (text || '').toLowerCase();
  const pos = (t.match(/great|good|excellent|positive|success|win/g) || []).length;
  const neg = (t.match(/bad|poor|negative|issue|problem|fail/g) || []).length;
  const score = Math.max(0, Math.min(100, 70 + (pos*5) - (neg*10)));
  const sentiment = neg > pos ? 'negative' : pos > 0 ? 'positive' : 'neutral';
  return { 
    summary: text.slice(0, 240) + "...", 
    sentiment, 
    objections: [], 
    score,
    suggestions: [{ title: "Basic Analysis", description: "Consider using more advanced AI for detailed feedback.", priority: "low" }],
    scoringBreakdown: [{ criteria: "Keyword Match", score, max: 100, reason: "Simple keyword analysis" }],
    keyPoints: ["Analysis failed or content too simple", "Check input format"],
    actionItems: ["Retry analysis"],
    engagementAnalysis: "N/A",
    negotiationOpportunities: []
  };
}

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await req.json();
  const items: Array<{ channel: string; text?: string; inlineData?: { data: string; mimeType: string } }> = Array.isArray(body.items) ? body.items : [];
  const out: any[] = [];

  for (const item of items) {
    try {
      let input: string | { inlineData: { data: string; mimeType: string } };
      
      // If it's a Fireflies link or URL-based input, we might need to handle it differently
      // For now, we pass the text containing the URL if inlineData is missing
      if (item.inlineData) {
        input = { inlineData: item.inlineData };
      } else {
        input = (item.text || '').slice(0, 30000); // Increased limit
      }

      const r = await analyzeSalesInput(input, item.channel);
      out.push({ id: Math.random().toString(36).slice(2), channel: item.channel, ...r });
    } catch (e) {
      console.error("Analysis error:", e);
      const text = item.text || (item.inlineData ? "File content..." : "");
      const r = fallbackAnalyze(text);
      out.push({ id: Math.random().toString(36).slice(2), channel: item.channel, ...r });
    }
  }

  // Aggregate insights text using model if available
  let insights: string | null = null;
  try {
    const totals = {
      callsMade: out.filter(i=>['R1','R2','R3','Cold Call'].includes(i.channel)).length,
      callsAnswered: Math.round(out.filter(i=>['R1','R2','R3','Cold Call'].includes(i.channel)).reduce((s,v)=>s+v.score,0)/Math.max(1,out.length)),
      r1Meetings: out.filter(i=>i.channel==='R1').length,
      dealsClose: out.filter(i=>i.score>80).length,
    };
    insights = await generateActivityInsights(totals);
  } catch {
    insights = null;
  }

  return NextResponse.json({ items: out, insights });
}
