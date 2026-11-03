import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createDatabaseSession,
  registerOrSignInUserWithInvite,
  setSessionCookies,
} from '@/lib/auth';
import { extractRequestMeta } from '@/lib/audit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  const rawInvite = body.inviteCode || body.invitationCode;
  const inviteCode = rawInvite ? String(rawInvite).trim().toUpperCase() : null;
  const password = body.password ? String(body.password) : null;
  const name = body.name ? String(body.name) : null;
  const { ipAddress, userAgent } = extractRequestMeta(req);

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  // Support both 6-digit OTP verification AND direct password+invite registration/sign-in
  let effectiveInviteCode = inviteCode;

  if (code) {
    const record = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired 6-digit verification code.' },
        { status: 400 }
      );
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    if (!effectiveInviteCode && record.inviteCode) {
      effectiveInviteCode = record.inviteCode;
    }
  } else if (!password) {
    return NextResponse.json(
      { error: 'Enter the 6-digit verification code or your password.' },
      { status: 400 }
    );
  }

  const result = await registerOrSignInUserWithInvite({
    email,
    name,
    password,
    inviteCode: effectiveInviteCode,
    ipAddress,
    userAgent,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { sessionToken, expires } = await createDatabaseSession(result.user.id);
  await setSessionCookies(sessionToken, expires);

  return NextResponse.json({
    authenticated: true,
    isNewUser: result.isNewUser,
    account: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      emailVerified: true,
    },
  });
}
