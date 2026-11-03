import crypto from 'crypto';
import { NextResponse } from 'next/server';

const PRICES: Record<string, number> = {
  USD: 1999,
  AUD: 2799,
  EUR: 1999,
  GBP: 1599,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawCurr = (url.searchParams.get('currency') || 'USD').toUpperCase();
  const currency = PRICES[rawCurr] ? rawCurr : 'USD';
  const amountMinor = PRICES[currency];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  return NextResponse.json({
    id: crypto.randomUUID(),
    currency,
    amountMinor,
    regularMinor: amountMinor,
    minorDigits: 2,
    discountPercent: 0,
    baseCurrency: 'AUD',
    baseAmountCents: 2799,
    baseLaunchUsdCents: 999,
    baseRegularAudCents: 2799,
    fixedRegularMinor: amountMinor,
    promotion: {
      state: 'ended',
      active: false,
      startsAt: '2026-10-13T21:00:00+11:00',
      endsAt: '2026-10-14T10:00:00.000Z',
      timeZone: 'Australia/Sydney',
      durationDays: 1,
    },
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}
