import { NextResponse } from 'next/server';
import memory from '../../../lib/memoryStore';

export async function POST(req: Request) {
  // reset in-memory stats
  memory.reset();
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  // provide a quick status of memory sizes
  return NextResponse.json({ activities: memory.activities.length, deals: memory.deals.length });
}
