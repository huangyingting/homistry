import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ threads: [] });
  }

  const threads = await prisma.supportThread.findMany({
    where: {
      OR: [{ userId: user.id }, { email: user.email }],
    },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ threads });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || body.body || '').trim();
  const subject = String(body.subject || 'Support question').trim();

  if (!message) {
    return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 });
  }

  const thread = await prisma.supportThread.create({
    data: {
      userId: user.id,
      email: user.email,
      name: user.name,
      subject,
      messages: {
        create: {
          sender: 'user',
          body: message,
        },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json({ thread }, { status: 201 });
}
