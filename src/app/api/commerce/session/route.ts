import { NextResponse } from 'next/server';
import { clearSessionCookies, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractRequestMeta, recordAuditLog } from '@/lib/audit';

const SUBSCRIPTION_OPTIONS = [
  {
    currency: 'USD',
    monthlyCredits: 40,
    plans: [
      { interval: 'month', amountMinor: 1999, lookupKey: 'homistry_monthly_usd' },
      { interval: 'year', amountMinor: 9900, lookupKey: 'homistry_yearly_usd' },
    ],
  },
  {
    currency: 'AUD',
    monthlyCredits: 40,
    plans: [
      { interval: 'month', amountMinor: 2799, lookupKey: 'homistry_monthly_aud' },
      { interval: 'year', amountMinor: 14900, lookupKey: 'homistry_yearly_aud' },
    ],
  },
  {
    currency: 'EUR',
    monthlyCredits: 40,
    plans: [
      { interval: 'month', amountMinor: 1999, lookupKey: 'homistry_monthly_eur' },
      { interval: 'year', amountMinor: 9900, lookupKey: 'homistry_yearly_eur' },
    ],
  },
];

export async function GET() {
  const user = await getCurrentUser();

  const homes = user
    ? await prisma.homeBuild.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          storeys: true,
          roofType: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    : [];

  const activeCurrency = user?.currency || 'USD';
  const currentOption =
    SUBSCRIPTION_OPTIONS.find(o => o.currency === activeCurrency) || SUBSCRIPTION_OPTIONS[0];

  return NextResponse.json({
    authenticated: Boolean(user),
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          plan: user.subscriptionInterval || 'month',
          currency: activeCurrency,
          credits: user.credits,
          maxBuilds: user.subscriptionInterval === 'year' ? 10 : 3,
          buildsCount: homes.length,
        }
      : null,
    account: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: Boolean(user.emailVerified),
        }
      : null,
    owner: user?.role === 'ADMIN',
    credits: user?.credits ?? 0,
    hasPaidHome: homes.length > 0,
    privateTest: { enabled: false, credits: 0 },
    filmCamera: true,
    nextHomeCents: 2799,
    digitalPricing: {
      launchUsdCents: 999,
      regularAudCents: 2799,
      currency: 'AUD',
      amountCents: 2799,
      promotion: {
        state: 'ended',
        active: false,
        startsAt: '2026-10-13T21:00:00+11:00',
        endsAt: '2026-10-14T10:00:00.000Z',
        timeZone: 'Australia/Sydney',
        durationDays: 1,
      },
    },
    currency: activeCurrency,
    payments: {
      provider: 'stripe',
      adaptivePricing: false,
      managedPayments: false,
      environment: 'live',
      ready: true,
      reason: null,
    },
    homes,
    purchases: [],
    print: {
      priceCents: 29900,
      furnitureCents: 4900,
      available: false,
      reason:
        'Australian print ordering opens after postage, turnaround and production checks are confirmed.',
    },
    accountRecoveryReady: true,
    emailDelivery: { ready: true },
    failedHome: null,
    subscription: {
      enabled: true,
      active: user?.subscriptionStatus === 'active',
      source: user?.subscriptionStatus === 'active' ? 'stripe' : null,
      until: user?.subscriptionRenewsAt?.toISOString() ?? null,
      status: user?.subscriptionStatus ?? null,
      interval: user?.subscriptionInterval ?? null,
      cancelAtPeriodEnd: false,
      renewsAt: user?.subscriptionRenewsAt?.toISOString() ?? null,
      running: user?.subscriptionStatus === 'active',
      paymentFailed: false,
      credits: user?.credits ?? 0,
      creditsExpireAt: user?.subscriptionRenewsAt?.toISOString() ?? null,
      canBuild: Boolean(user),
      nextMonthAt: user?.subscriptionRenewsAt?.toISOString() ?? null,
      currencyLocked: false,
      currency: currentOption.currency,
      monthlyCredits: 40,
      plans: currentOption.plans,
      options: SUBSCRIPTION_OPTIONS,
      checkout: { ready: true, reason: null },
    },
  });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  const { ipAddress, userAgent } = extractRequestMeta(req);
  await clearSessionCookies();

  if (user) {
    await recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGOUT',
      targetType: 'User',
      targetId: user.id,
      ipAddress,
      userAgent,
    });
  }

  return NextResponse.json({ signedOut: true });
}
