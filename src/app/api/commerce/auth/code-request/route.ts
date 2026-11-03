import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInvitationCode } from '@/lib/invitations';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const rawInvite = body.inviteCode || body.invitationCode;
  const inviteCode = rawInvite ? String(rawInvite).trim().toUpperCase() : null;
  const { ipAddress, userAgent } = extractRequestMeta(req);

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (existingUser.status === 'REVOKED' || existingUser.revokedAt) {
      await recordAuditLog({
        actorUserId: existingUser.id,
        actorEmail: existingUser.email,
        action: 'USER_LOGIN_REVOKED_BLOCKED',
        targetType: 'User',
        targetId: existingUser.id,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { error: 'This account has been revoked by an administrator.' },
        { status: 403 }
      );
    }
  } else if (inviteCode) {
    // Validate invitation code immediately when provided during code-request
    const check = await validateInvitationCode(inviteCode, email);
    if (!check.valid) {
      await recordAuditLog({
        actorEmail: email,
        action: 'USER_REGISTRATION_REJECTED',
        targetType: 'InvitationCode',
        ipAddress,
        userAgent,
        metadata: { attemptedInviteCode: inviteCode, reason: check.error },
      });
      return NextResponse.json({ error: check.error, requiresInvite: true }, { status: 403 });
    }
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      inviteCode,
      expiresAt,
    },
  });

  await recordAuditLog({
    actorUserId: existingUser?.id ?? null,
    actorEmail: email,
    action: 'AUTH_CODE_REQUESTED',
    targetType: 'VerificationCode',
    ipAddress,
    userAgent,
    metadata: { isExistingUser: Boolean(existingUser), inviteCode },
  });

  return NextResponse.json({
    sent: true,
    email,
    isExistingUser: Boolean(existingUser),
    devCode: code,
    verificationCodePreview: code,
  });
}
