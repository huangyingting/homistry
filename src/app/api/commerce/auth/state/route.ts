import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const userCount = await prisma.user.count();
  return NextResponse.json({
    google: { ready: false },
    facebook: { ready: false },
    email: { ready: true },
    inviteOnly: true,
    bootstrapAvailable: userCount === 0,
  });
}
