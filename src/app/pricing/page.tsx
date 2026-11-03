'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

const CURRENCIES: Record<string, { symbol: string; one: number; month: number; year: number }> = {
  AUD: { symbol: 'A$', one: 29, month: 39, year: 290 },
  USD: { symbol: '$', one: 19, month: 29, year: 220 },
  EUR: { symbol: '€', one: 18, month: 27, year: 199 },
  GBP: { symbol: '£', one: 15, month: 23, year: 175 },
  CAD: { symbol: 'CA$', one: 25, month: 39, year: 290 },
  NZD: { symbol: 'NZ$', one: 32, month: 45, year: 320 },
};

export default function PricingPage() {
  const [currency, setCurrency] = useState('AUD');
  const price = CURRENCIES[currency] || CURRENCIES.AUD;

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div>
            <span className="rl-eyebrow">TRANSPARENT PRICING</span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', marginBottom: '12px' }}>
              Pay for one floor plan, or your whole build journey.
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '640px', fontSize: '1.05rem' }}>
              Every tier unlocks the full 2D/3D Studio, scaled furniture catalogue, cladding
              visualizer, solar path simulation, smart electrical planner, and shareable
              walkthrough links.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="pricing-currency" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              Currency
            </label>
            <select
              id="pricing-currency"
              aria-label="Currency"
              className="rl-input"
              style={{ width: 'auto', padding: '8px 14px' }}
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '56px',
          }}
        >
          <div className="rl-card">
            <span className="rl-eyebrow">ONE FLOOR PLAN</span>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>One-off build</h2>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '14px' }}>
              {price.symbol}
              {price.one}{' '}
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>one-time</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: '10px',
                fontSize: '0.92rem',
                color: 'var(--text-muted)',
                marginBottom: '24px',
              }}
            >
              <li>✓ 1 interactive 3D home build (1 or 2 storeys)</li>
              <li>✓ Unlimited furniture placement & wall edits</li>
              <li>✓ 10 photorealistic camera render credits</li>
              <li>✓ Unlimited view-only share links</li>
            </ul>
            <Link
              href={`/signup?plan=one_build&currency=${currency}`}
              className="rl-btn rl-btn-secondary"
              style={{ width: '100%' }}
            >
              Start with one build →
            </Link>
          </div>

          <div className="rl-card" style={{ border: '2px solid var(--accent-forest)' }}>
            <span className="rl-eyebrow" style={{ color: 'var(--accent-forest)' }}>
              MOST POPULAR · MONTHLY PASS
            </span>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Monthly pass</h2>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '14px' }}>
              {price.symbol}
              {price.month}{' '}
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ month</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: '10px',
                fontSize: '0.92rem',
                color: 'var(--text-muted)',
                marginBottom: '24px',
              }}
            >
              <li>✓ Up to 3 active home builds at a time</li>
              <li>✓ 30 photorealistic camera render credits / month</li>
              <li>✓ Smart electrical & site sun-study planner</li>
              <li>✓ Cancel or pause any time in one click</li>
            </ul>
            <Link
              href={`/signup?plan=month&currency=${currency}`}
              className="rl-btn rl-btn-primary"
              style={{ width: '100%' }}
            >
              Start Monthly pass →
            </Link>
          </div>

          <div className="rl-card">
            <span className="rl-eyebrow">FULL BUILD & PRE-START</span>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Yearly pass</h2>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '14px' }}>
              {price.symbol}
              {price.year}{' '}
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ year</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: '10px',
                fontSize: '0.92rem',
                color: 'var(--text-muted)',
                marginBottom: '24px',
              }}
            >
              <li>✓ Up to 10 active home builds for comparing builder quotes</li>
              <li>✓ 120 photorealistic camera render credits / year</li>
              <li>✓ Full version history across every builder revision</li>
              <li>✓ Priority plan conversion & support</li>
            </ul>
            <Link
              href={`/signup?plan=year&currency=${currency}`}
              className="rl-btn rl-btn-secondary"
              style={{ width: '100%' }}
            >
              Start Yearly pass →
            </Link>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
