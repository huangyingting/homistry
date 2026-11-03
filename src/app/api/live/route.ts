import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ homes: [] });
  }

  const homes = await prisma.homeBuild.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      builder: true,
      status: true,
      storeys: true,
      unit: true,
      roofType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ homes });
}
