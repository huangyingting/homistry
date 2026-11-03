import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ id: null });
  }

  const latest = await prisma.homeBuild.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, status: true },
  });

  return NextResponse.json({ id: latest?.id ?? null, build: latest });
}
