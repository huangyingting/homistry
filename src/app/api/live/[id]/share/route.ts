import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const link = await prisma.shareLink.findFirst({
    where: { homeBuildId: id, active: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    active: Boolean(link),
    token: link?.token ?? null,
    shareUrl: link ? `/share/${link.token}` : null,
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const existing = await prisma.shareLink.findFirst({
    where: { homeBuildId: id, active: true },
  });

  if (existing) {
    return NextResponse.json({
      active: true,
      token: existing.token,
      shareUrl: `/share/${existing.token}`,
    });
  }

  const token = crypto.randomBytes(12).toString('hex');
  const created = await prisma.shareLink.create({
    data: {
      homeBuildId: id,
      token,
      active: true,
    },
  });

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'SHARE_CREATED',
    targetType: 'ShareLink',
    targetId: created.id,
    ipAddress,
    userAgent,
    metadata: { homeBuildId: id, token },
  });

  return NextResponse.json(
    {
      active: true,
      token: created.token,
      shareUrl: `/share/${created.token}`,
    },
    { status: 201 }
  );
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const { ipAddress, userAgent } = extractRequestMeta(req);

  await prisma.shareLink.updateMany({
    where: { homeBuildId: id, active: true },
    data: { active: false, revokedAt: new Date() },
  });

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'SHARE_REVOKED',
    targetType: 'ShareLink',
    targetId: id,
    ipAddress,
    userAgent,
    metadata: { homeBuildId: id },
  });

  return NextResponse.json({ active: false, token: null });
}
