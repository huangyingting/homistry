import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || user?.name || '').trim();
  const email = String(body.email || user?.email || '').trim().toLowerCase();
  const message = String(body.message || '').trim();
  const { ipAddress, userAgent } = extractRequestMeta(req);

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: 'Please write a message.' }, { status: 400 });
  }

  const thread = await prisma.supportThread.create({
    data: {
      userId: user?.id ?? null,
      email,
      name: name || null,
      subject: 'Contact form inquiry',
      messages: {
        create: {
          sender: 'user',
          body: message,
        },
      },
    },
  });

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: email,
    action: 'CONTACT_SUBMITTED',
    targetType: 'SupportThread',
    targetId: thread.id,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ sent: true, id: thread.id }, { status: 201 });
}
