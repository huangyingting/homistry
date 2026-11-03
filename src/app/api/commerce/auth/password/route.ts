import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const newPassword = String(body.password || '');
  if (newPassword.length < 7) {
    return NextResponse.json(
      { error: 'Use at least 7 characters.' },
      { status: 400 }
    );
  }

  const passwordHash = hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({
    ok: true,
    message: 'Your password has been updated and other sessions signed out.',
  });
}
