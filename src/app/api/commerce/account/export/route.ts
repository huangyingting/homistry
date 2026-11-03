import { NextResponse } from 'next/server';
import { clearSessionCookies, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { ipAddress, userAgent } = extractRequestMeta(req);
  const fullData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      drafts: { include: { files: { select: { id: true, name: true, mimeType: true, bytes: true, createdAt: true } } } },
      homeBuilds: { include: { versions: true, pieces: true, frameRenders: true, shareLinks: true } },
      supportThreads: { include: { messages: true } },
    },
  });

  await recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'ACCOUNT_EXPORTED',
    targetType: 'User',
    targetId: user.id,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    account: fullData
      ? {
          id: fullData.id,
          email: fullData.email,
          name: fullData.name,
          role: fullData.role,
          currency: fullData.currency,
          credits: fullData.credits,
          createdAt: fullData.createdAt,
          drafts: fullData.drafts,
          homeBuilds: fullData.homeBuilds,
          supportThreads: fullData.supportThreads,
        }
      : null,
  });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { ipAddress, userAgent } = extractRequestMeta(req);
  await clearSessionCookies();

  await recordAuditLog({
    actorEmail: user.email,
    action: 'ACCOUNT_DELETED',
    targetType: 'User',
    targetId: user.id,
    ipAddress,
    userAgent,
  });

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ deleted: true });
}
