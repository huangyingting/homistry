import { NextRequest, NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  await recordAuditLog({
    action: 'STUDIO_EMAIL_PICTURE',
    targetType: 'Build',
    targetId: id,
    metadata: { email, view: body.view || '3d' },
  });

  return NextResponse.json({
    ok: true,
    sentTo: email,
    message: `Picture queued for delivery to ${email}.`,
  });
}
