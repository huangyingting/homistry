import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    base: 'AUD',
    rates: {
      AUD: 1,
      USD: 0.70063,
      EUR: 0.62567,
      GBP: 0.52217,
    },
    dates: {
      USD: today,
      EUR: today,
      GBP: today,
    },
    date: today,
    source: 'Frankfurter',
    available: true,
    currencies: ['AUD', 'USD', 'EUR', 'GBP'],
  });
}
