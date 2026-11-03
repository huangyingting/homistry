import crypto from 'crypto';
import { cookies } from 'next/headers';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { recordAuditLog } from './audit';
import { validateInvitationCode } from './invitations';

export const SESSION_COOKIE_NAME = 'hm_session_token';
export const SIGNED_IN_COOKIE_NAME = 'hm_signed_in';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = (storedHash || '').split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export async function createDatabaseSession(userId: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });
  return { sessionToken, expires };
}

export async function setSessionCookies(sessionToken: string, expires: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires,
  });
  cookieStore.set(SIGNED_IN_COOKIE_NAME, '1', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(SIGNED_IN_COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session) return null;

    if (session.expires.getTime() <= Date.now()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    const user = session.user;
    if (!user || user.status === 'REVOKED' || user.revokedAt) {
      await prisma.session.deleteMany({ where: { userId: user?.id } }).catch(() => {});
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function registerOrSignInUserWithInvite(params: {
  email: string;
  name?: string | null;
  password?: string | null;
  inviteCode?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const normalizedEmail = params.email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { ok: false as const, status: 400, error: 'Please enter a valid email address.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    if (existingUser.status === 'REVOKED' || existingUser.revokedAt) {
      await recordAuditLog({
        actorUserId: existingUser.id,
        actorEmail: existingUser.email,
        action: 'USER_LOGIN_REVOKED_BLOCKED',
        targetType: 'User',
        targetId: existingUser.id,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
      return { ok: false as const, status: 403, error: 'Account access has been revoked by an administrator.' };
    }

    if (params.password && existingUser.passwordHash) {
      if (!verifyPassword(params.password, existingUser.passwordHash)) {
        await recordAuditLog({
          actorUserId: existingUser.id,
          actorEmail: existingUser.email,
          action: 'USER_LOGIN_FAILED',
          targetType: 'User',
          targetId: existingUser.id,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          metadata: { reason: 'invalid_password' },
        });
        return { ok: false as const, status: 401, error: 'Invalid email or password.' };
      }
    }

    await recordAuditLog({
      actorUserId: existingUser.id,
      actorEmail: existingUser.email,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: existingUser.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { ok: true as const, user: existingUser, isNewUser: false };
  }

  // New user registration: strictly enforce Invite-Only registration!
  const validation = await validateInvitationCode(params.inviteCode || '', normalizedEmail);
  if (!validation.valid) {
    await recordAuditLog({
      actorEmail: normalizedEmail,
      action: 'USER_REGISTRATION_REJECTED',
      targetType: 'InvitationCode',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        attemptedInviteCode: params.inviteCode || null,
        reason: validation.error,
      },
    });
    return { ok: false as const, status: 403, error: validation.error };
  }

  const invite = validation.invite;
  const passwordHash = params.password ? hashPassword(params.password) : null;
  const displayName =
    params.name?.trim() ||
    normalizedEmail
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

  const user = await prisma.$transaction(async tx => {
    const freshInvite = await tx.invitationCode.findUnique({ where: { id: invite.id } });
    if (
      !freshInvite ||
      freshInvite.status !== 'ACTIVE' ||
      freshInvite.usedCount >= freshInvite.maxUses ||
      freshInvite.expiresAt.getTime() <= Date.now()
    ) {
      throw new Error('Invitation code is no longer valid.');
    }

    const newUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: displayName,
        passwordHash,
        emailVerified: new Date(),
        role: freshInvite.role,
        status: 'ACTIVE',
        currency: 'USD',
        credits: 40,
      },
    });

    const newUsedCount = freshInvite.usedCount + 1;
    await tx.invitationCode.update({
      where: { id: freshInvite.id },
      data: {
        usedCount: newUsedCount,
        status: newUsedCount >= freshInvite.maxUses ? 'USED' : 'ACTIVE',
        redeemedByUserId: newUser.id,
        redeemedAt: new Date(),
      },
    });

    return newUser;
  });

  await recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'INVITE_REDEEMED',
    targetType: 'InvitationCode',
    targetId: invite.id,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { code: invite.code, roleAssigned: user.role },
  });

  await recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'USER_REGISTERED',
    targetType: 'User',
    targetId: user.id,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { role: user.role, inviteCode: invite.code },
  });

  return { ok: true as const, user, isNewUser: true };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Invite & Email Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        inviteCode: { label: 'Invitation Code', type: 'text' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '');
        const password = credentials?.password ? String(credentials.password) : null;
        const inviteCode = credentials?.inviteCode ? String(credentials.inviteCode) : null;
        const res = await registerOrSignInUserWithInvite({ email, password, inviteCode });
        if (!res.ok) return null;
        return {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: res.user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signup',
  },
});
