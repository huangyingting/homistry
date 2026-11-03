import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || '').replace(/\D/g, '');
  if (code.length !== 6) {
    return NextResponse.json({ error: 'Please enter the 6-digit code.' }, { status: 400 });
  }

  return NextResponse.json({
    allowed: false,
    waiting: true,
    message: 'Thanks. Your request is with us, and we’ll email you as soon as you’re in.',
  });
}
