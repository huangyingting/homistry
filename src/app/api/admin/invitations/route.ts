import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createInvitationCode, normalizeRole } from '@/lib/invitations';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const invitations = await prisma.invitationCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
      redeemedByUser: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ invitations });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const invite = await createInvitationCode({
    role: normalizeRole(body.role),
    boundEmail: body.boundEmail || body.email || null,
    maxUses: Number(body.maxUses || 1),
    expiresInHours: Number(body.expiresInHours ?? 72),
    createdById: user.id,
    actorEmail: user.email,
    note: body.note || null,
    customCode: body.customCode || null,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ invite, invitation: invite }, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const action = String(body.action || 'revoke');
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const existing = await prisma.invitationCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Invitation code not found.' }, { status: 404 });
  }

  if (action === 'revoke') {
    const updated = await prisma.invitationCode.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedById: user.id,
      },
    });

    await recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'INVITE_REVOKED',
      targetType: 'InvitationCode',
      targetId: updated.id,
      ipAddress,
      userAgent,
      metadata: { code: updated.code },
    });

    return NextResponse.json({ invite: updated });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
