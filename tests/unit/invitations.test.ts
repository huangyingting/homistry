import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  generateInviteCodeString,
  normalizeRole,
  createInvitationCode,
  validateInvitationCode,
} from '@/lib/invitations';
import { prisma } from '@/lib/prisma';

describe('Invite-Only Registration & Single-Use / Expiring Code Validation', () => {
  beforeAll(async () => {
    await prisma.auditLog.deleteMany({});
    await prisma.invitationCode.deleteMany({});
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({});
    await prisma.invitationCode.deleteMany({});
    await prisma.$disconnect();
  });

  it('generates invitation codes in HM-XXXX-XXXX format and normalizes RBAC roles', () => {
    const code = generateInviteCodeString();
    expect(code).toMatch(/^HM-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('builder')).toBe('BUILDER');
    expect(normalizeRole('unknown')).toBe('USER');
  });

  it('rejects empty or non-existent invitation codes', async () => {
    const emptyRes = await validateInvitationCode('', 'user@example.com');
    expect(emptyRes.valid).toBe(false);

    const missingRes = await validateInvitationCode('HM-NONE-9999', 'user@example.com');
    expect(missingRes.valid).toBe(false);
    if (!missingRes.valid) {
      expect(missingRes.error).toContain('Invalid invitation code');
    }
  });

  it('accepts a valid active single-use invitation code and records INVITE_CREATED audit log', async () => {
    const invite = await createInvitationCode({
      role: 'USER',
      maxUses: 1,
      expiresInHours: 24,
      actorEmail: 'admin@homistry.local',
    });

    const res = await validateInvitationCode(invite.code, 'user@example.com');
    expect(res.valid).toBe(true);

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'INVITE_CREATED', targetId: invite.id },
    });
    expect(audit).not.toBeNull();
  });

  it('rejects a revoked invitation code', async () => {
    const invite = await createInvitationCode({ role: 'USER', maxUses: 1 });
    await prisma.invitationCode.update({
      where: { id: invite.id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    const res = await validateInvitationCode(invite.code, 'user@example.com');
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('revoked');
    }
  });

  it('rejects an already-used single-use invitation code', async () => {
    const invite = await createInvitationCode({ role: 'USER', maxUses: 1 });
    await prisma.invitationCode.update({
      where: { id: invite.id },
      data: { status: 'USED', usedCount: 1 },
    });

    const res = await validateInvitationCode(invite.code, 'user@example.com');
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('already been used');
    }
  });

  it('rejects an expired invitation code and transitions status to EXPIRED', async () => {
    const invite = await createInvitationCode({ role: 'USER', maxUses: 1 });
    await prisma.invitationCode.update({
      where: { id: invite.id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    const res = await validateInvitationCode(invite.code, 'user@example.com');
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('expired');
    }

    const updated = await prisma.invitationCode.findUnique({ where: { id: invite.id } });
    expect(updated?.status).toBe('EXPIRED');
  });

  it('enforces email lock when boundEmail is set on an invitation code', async () => {
    const invite = await createInvitationCode({
      role: 'AGENT',
      boundEmail: 'locked@example.com',
      maxUses: 1,
    });

    const wrongUser = await validateInvitationCode(invite.code, 'other@example.com');
    expect(wrongUser.valid).toBe(false);

    const rightUser = await validateInvitationCode(invite.code, 'LOCKED@example.com');
    expect(rightUser.valid).toBe(true);
  });
});
