import crypto from 'crypto';
import { prisma } from './prisma';
import { recordAuditLog } from './audit';

export type UserRole = 'ADMIN' | 'BUILDER' | 'AGENT' | 'USER';

const VALID_ROLES: UserRole[] = ['ADMIN', 'BUILDER', 'AGENT', 'USER'];

export function normalizeRole(role?: string | null): UserRole {
  const upper = (role || 'USER').toUpperCase() as UserRole;
  return VALID_ROLES.includes(upper) ? upper : 'USER';
}

export function generateInviteCodeString(prefix = 'HM'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len: number) =>
    Array.from(crypto.randomBytes(len))
      .map(b => chars[b % chars.length])
      .join('');
  return `${prefix}-${part(4)}-${part(4)}`;
}

export interface CreateInvitationOptions {
  role?: UserRole;
  boundEmail?: string | null;
  maxUses?: number;
  expiresInHours?: number;
  createdById?: string | null;
  actorEmail?: string | null;
  note?: string | null;
  customCode?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createInvitationCode(opts: CreateInvitationOptions) {
  const code = (opts.customCode?.trim().toUpperCase() || generateInviteCodeString());
  const role = normalizeRole(opts.role);
  const maxUses = Math.max(1, Math.min(1000, Number(opts.maxUses || 1)));
  const expiresInHours = Math.max(0.05, Number(opts.expiresInHours ?? 72));
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);
  const boundEmail = opts.boundEmail ? opts.boundEmail.trim().toLowerCase() : null;

  const invite = await prisma.invitationCode.create({
    data: {
      code,
      role,
      boundEmail,
      maxUses,
      usedCount: 0,
      status: 'ACTIVE',
      expiresAt,
      createdById: opts.createdById ?? null,
      note: opts.note ?? null,
    },
  });

  await recordAuditLog({
    actorUserId: opts.createdById ?? null,
    actorEmail: opts.actorEmail ?? null,
    action: 'INVITE_CREATED',
    targetType: 'InvitationCode',
    targetId: invite.id,
    ipAddress: opts.ipAddress,
    userAgent: opts.userAgent,
    metadata: {
      code: invite.code,
      role: invite.role,
      boundEmail: invite.boundEmail,
      maxUses: invite.maxUses,
      expiresAt: invite.expiresAt.toISOString(),
    },
  });

  return invite;
}

export async function validateInvitationCode(rawCode: string, email?: string | null) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false as const, error: 'An invitation code is required to register a new account.' };
  }

  const invite = await prisma.invitationCode.findUnique({ where: { code } });
  if (!invite) {
    return { valid: false as const, error: 'Invalid invitation code.' };
  }

  if (invite.status === 'REVOKED' || invite.revokedAt) {
    return { valid: false as const, error: 'This invitation code has been revoked.' };
  }

  if (invite.status === 'USED' || invite.usedCount >= invite.maxUses) {
    return { valid: false as const, error: 'This invitation code has already been used.' };
  }

  if (invite.expiresAt.getTime() <= Date.now()) {
    if (invite.status === 'ACTIVE') {
      await prisma.invitationCode.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
    }
    return { valid: false as const, error: 'This invitation code has expired.' };
  }

  if (invite.boundEmail && email && invite.boundEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return {
      valid: false as const,
      error: `This invitation code is restricted to ${invite.boundEmail}.`,
    };
  }

  return { valid: true as const, invite };
}
