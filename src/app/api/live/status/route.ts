import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ready: true,
    queueDepth: 0,
    estimatedMinutes: 2,
    timestamp: new Date().toISOString(),
  });
}
