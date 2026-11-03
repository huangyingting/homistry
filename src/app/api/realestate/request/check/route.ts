import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();
  const website = String(body.website || '').trim();

  if (!email || !name || !website) {
    return NextResponse.json(
      { error: 'Please enter your name, agency website, and work email.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    waiting: false,
    minutes: 10,
    message: `We sent a 6-digit code to ${email}. It works for 10 minutes.`,
  });
}
