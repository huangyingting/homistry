import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to manage your subscription.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const interval = body.interval === 'year' ? 'year' : 'month';
  const currency = ['USD', 'AUD', 'EUR', 'GBP'].includes(String(body.currency || '').toUpperCase())
    ? String(body.currency).toUpperCase()
    : user.currency || 'USD';
  const { ipAddress, userAgent } = extractRequestMeta(req);

  const renewsAt = new Date(
    Date.now() + (interval === 'year' ? 365 : 30) * 24 * 3600 * 1000
  );

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      currency,
      subscriptionStatus: 'active',
      subscriptionInterval: interval,
      subscriptionRenewsAt: renewsAt,
      credits: Math.max(user.credits, 40),
    },
  });

  await recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'SUBSCRIPTION_ACTIVATED',
    targetType: 'Subscription',
    targetId: user.id,
    ipAddress,
    userAgent,
    metadata: { interval, currency, renewsAt: renewsAt.toISOString() },
  });

  return NextResponse.json({
    subscribed: true,
    interval: updated.subscriptionInterval,
    currency: updated.currency,
    status: updated.subscriptionStatus,
    renewsAt: updated.subscriptionRenewsAt?.toISOString(),
    credits: updated.credits,
  });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  }

  const { ipAddress, userAgent } = extractRequestMeta(req);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'canceled',
    },
  });

  await recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'SUBSCRIPTION_CANCELED',
    targetType: 'Subscription',
    targetId: user.id,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ canceled: true });
}
