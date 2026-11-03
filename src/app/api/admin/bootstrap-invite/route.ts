import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInvitationCode } from '@/lib/invitations';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function GET() {
  const userCount = await prisma.user.count();
  const activeBootstrapInvite =
    userCount === 0
      ? await prisma.invitationCode.findFirst({
          where: { status: 'ACTIVE', role: 'ADMIN', usedCount: 0, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        })
      : null;

  return NextResponse.json({
    bootstrapAvailable: userCount === 0,
    userCount,
    activeBootstrapCode: activeBootstrapInvite?.code ?? null,
  });
}

export async function POST(req: Request) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return NextResponse.json(
      { error: 'System bootstrap is locked because an administrator account already exists.' },
      { status: 403 }
    );
  }

  const { ipAddress, userAgent } = extractRequestMeta(req);
  const existing = await prisma.invitationCode.findFirst({
    where: { status: 'ACTIVE', role: 'ADMIN', usedCount: 0, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    const payload = {
      id: existing.id,
      code: existing.code,
      role: existing.role,
      maxUses: existing.maxUses,
      expiresAt: existing.expiresAt.toISOString(),
    };
    return NextResponse.json({ invite: payload, invitation: payload });
  }

  const invite = await createInvitationCode({
    role: 'ADMIN',
    maxUses: 1,
    expiresInHours: 24,
    note: 'Initial system bootstrap administrator single-use invitation',
    ipAddress,
    userAgent,
  });

  await recordAuditLog({
    action: 'SYSTEM_BOOTSTRAP_ADMIN_INVITE',
    targetType: 'InvitationCode',
    targetId: invite.id,
    ipAddress,
    userAgent,
    metadata: { code: invite.code },
  });

  const payload = {
    id: invite.id,
    code: invite.code,
    role: invite.role,
    maxUses: invite.maxUses,
    expiresAt: invite.expiresAt.toISOString(),
  };

  return NextResponse.json(
    {
      invite: payload,
      invitation: payload,
    },
    { status: 201 }
  );
}
