'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlan = searchParams.get('plan') || 'month';
  const initialCurrency = (searchParams.get('currency') || 'AUD').toUpperCase();
  const initialInvite = searchParams.get('invite') || '';

  const [selectedPlan, setSelectedPlan] = useState<'month' | 'year' | 'one_build'>(
    initialPlan === 'year' || initialPlan === 'one_build' ? initialPlan : 'month'
  );
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState(initialInvite);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devCodePreview, setDevCodePreview] = useState<string | null>(null);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/bootstrap-invite')
      .then(r => r.json())
      .then(data => {
        if (data?.bootstrapAvailable) {
          setBootstrapAvailable(true);
        }
      })
      .catch(() => {});
  }, []);

  const prices: Record<string, { symbol: string; month: number; year: number; one_build: number }> = {
    AUD: { symbol: 'A$', month: 39, year: 290, one_build: 29 },
    USD: { symbol: '$', month: 29, year: 220, one_build: 19 },
    EUR: { symbol: '€', month: 27, year: 199, one_build: 18 },
    GBP: { symbol: '£', month: 23, year: 175, one_build: 15 },
    CAD: { symbol: 'CA$', month: 39, year: 290, one_build: 25 },
    NZD: { symbol: 'NZ$', month: 45, year: 320, one_build: 32 },
  };

  const activePrice = prices[currency] || prices.AUD;

  async function handleGenerateBootstrapInvite() {
    setBootstrapLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/bootstrap-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not generate bootstrap invite.');
      } else if (data.invitation?.code) {
        setInvitationCode(data.invitation.code);
      }
    } catch {
      setError('Failed to contact server.');
    } finally {
      setBootstrapLoading(false);
    }
  }

  async function handleSendVerificationCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!invitationCode.trim()) {
      setError('An invitation code is required to register on Homistry.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/commerce/auth/code-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code.');
      } else {
        setOtpSent(true);
        if (data.devCode) {
          setDevCodePreview(data.devCode);
          setOtpCode(data.devCode);
        }
      }
    } catch {
      setError('Network error while requesting verification code.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyAndCompleteSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/commerce/auth/code-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode,
          invitationCode,
          name,
          password: password || undefined,
          plan: selectedPlan,
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        router.push('/account');
      }
    } catch {
      setError('Network error while verifying registration.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rl-container" style={{ padding: '56px 24px 80px', maxWidth: '960px' }}>
      <span className="rl-eyebrow">INVITE-ONLY REGISTRATION</span>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '12px' }}>
        Start your Homistry account
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '640px', marginBottom: '32px' }}>
        Choose a plan and enter your single-use invitation code to activate your workspace.
        Every plan includes full access to the 2D/3D Studio, furniture library, sun study,
        and shareable walkthrough links.
      </p>

      {bootstrapAvailable && (
        <div
          className="rl-card-tinted"
          style={{
            marginBottom: '28px',
            borderLeft: '4px solid var(--accent-forest)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div className="rl-eyebrow" style={{ marginBottom: '4px', color: 'var(--accent-forest)' }}>
              FIRST-RUN ADMIN BOOTSTRAP
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-ink)' }}>
              No users are registered in this database yet. Generate a single-use{' '}
              <strong>ADMIN</strong> invitation code to initialize the first administrator
              account.
            </p>
          </div>
          <button
            type="button"
            className="rl-btn rl-btn-primary"
            onClick={handleGenerateBootstrapInvite}
            disabled={bootstrapLoading}
          >
            {bootstrapLoading ? 'Generating...' : 'Generate Bootstrap Admin Code'}
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '28px',
          alignItems: 'start',
        }}
      >
        <div className="rl-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ fontSize: '1.35rem' }}>1. Select your plan</h2>
            <select
              aria-label="Currency"
              className="rl-input"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {Object.keys(prices).map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              {
                id: 'month' as const,
                title: 'Monthly pass',
                price: `${activePrice.symbol}${activePrice.month} / month`,
                desc: 'Up to 3 active home builds, 30 photoreal render credits/mo, cancel any time.',
              },
              {
                id: 'year' as const,
                title: 'Yearly pass',
                price: `${activePrice.symbol}${activePrice.year} / year`,
                desc: 'Up to 10 active home builds, 120 photoreal render credits/yr, priority turnarounds.',
              },
              {
                id: 'one_build' as const,
                title: 'One-off build',
                price: `${activePrice.symbol}${activePrice.one_build} once`,
                desc: 'Convert 1 floor plan into an editable 3D home with 10 photoreal credits.',
              },
            ].map(option => {
              const selected = selectedPlan === option.id;
              return (
                <label
                  key={option.id}
                  style={{
                    display: 'block',
                    padding: '16px',
                    borderRadius: '12px',
                    border: selected
                      ? '2px solid var(--accent-forest)'
                      : '1px solid var(--border-sand)',
                    background: selected ? 'var(--bg-paper)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="plan"
                        value={option.id}
                        checked={selected}
                        onChange={() => setSelectedPlan(option.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {option.title}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {option.price}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {option.desc}
                  </p>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rl-card">
          <h2 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>
            2. Invitation & account details
          </h2>

          {error && (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#FDF2F0',
                border: '1px solid #E5A99C',
                color: '#8E2B18',
                fontSize: '0.9rem',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={otpSent ? handleVerifyAndCompleteSignup : handleSendVerificationCode}
            style={{ display: 'grid', gap: '14px' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Invitation code *
              </label>
              <input
                type="text"
                className="rl-input"
                placeholder="HM-XXXX-XXXX"
                value={invitationCode}
                onChange={e => setInvitationCode(e.target.value.toUpperCase())}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Single-use or time-limited invitation code issued by an administrator.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Email address *
              </label>
              <input
                type="email"
                className="rl-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Full name (optional)
              </label>
              <input
                type="text"
                className="rl-input"
                placeholder="Alex Taylor"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                Password (optional, for password sign-in)
              </label>
              <input
                type="password"
                className="rl-input"
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {otpSent && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                  6-digit email verification code *
                </label>
                <input
                  type="text"
                  className="rl-input"
                  placeholder="123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  required
                />
                {devCodePreview && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-forest)', marginTop: '6px' }}>
                    Verification code generated for your session: <strong>{devCodePreview}</strong>
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="rl-btn rl-btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {submitting
                ? 'Processing...'
                : otpSent
                  ? 'Verify code & create account →'
                  : 'Send verification code →'}
            </button>
          </form>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '16px' }}>
            Already have an account? <Link href="/account" style={{ textDecoration: 'underline' }}>Sign in on the Account page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <SiteChrome>
      <Suspense fallback={<div className="rl-container" style={{ padding: '64px 24px' }}>Loading signup...</div>}>
        <SignupContent />
      </Suspense>
    </SiteChrome>
  );
}
