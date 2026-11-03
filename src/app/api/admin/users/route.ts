import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { normalizeRole } from '@/lib/invitations';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      revokedAt: true,
      revokedReason: true,
      currency: true,
      credits: true,
      subscriptionStatus: true,
      subscriptionInterval: true,
      createdAt: true,
      _count: {
        select: { homeBuilds: true, sessions: true },
      },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || '');
  const action = String(body.action || (body.role ? 'role' : ''));
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (action === 'role') {
    const newRole = normalizeRole(body.role);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: 'USER_ROLE_UPDATED',
      targetType: 'User',
      targetId: updated.id,
      ipAddress,
      userAgent,
      metadata: { targetEmail: updated.email, previousRole: target.role, newRole },
    });

    return NextResponse.json({ user: updated });
  }

  if (action === 'revoke') {
    if (target.id === admin.id) {
      return NextResponse.json({ error: 'You cannot revoke your own active administrator session.' }, { status: 400 });
    }
    const reason = body.reason ? String(body.reason) : 'Revoked by administrator';
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedById: admin.id,
        revokedReason: reason,
      },
    });
    // Immediately terminate all active sessions for the revoked user
    await prisma.session.deleteMany({ where: { userId: updated.id } });

    await recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: 'USER_REVOKED',
      targetType: 'User',
      targetId: updated.id,
      ipAddress,
      userAgent,
      metadata: { targetEmail: updated.email, reason },
    });

    return NextResponse.json({ user: updated });
  }

  if (action === 'restore') {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        revokedAt: null,
        revokedById: null,
        revokedReason: null,
      },
    });

    await recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: 'USER_RESTORED',
      targetType: 'User',
      targetId: updated.id,
      ipAddress,
      userAgent,
      metadata: { targetEmail: updated.email },
    });

    return NextResponse.json({ user: updated });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
