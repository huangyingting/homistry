import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const url = new URL(req.url);
  const actionFilter = url.searchParams.get('action') || undefined;
  const limit = Math.min(200, Math.max(10, Number(url.searchParams.get('limit') || 100)));

  const logs = await prisma.auditLog.findMany({
    where: actionFilter ? { action: actionFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actor: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  return NextResponse.json({
    logs: logs.map(l => ({
      ...l,
      parsedMetadata: (() => {
        try {
          return JSON.parse(l.metadata);
        } catch {
          return {};
        }
      })(),
    })),
  });
}
