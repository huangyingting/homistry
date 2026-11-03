'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { SiteChrome } from '@/components/SiteChrome';

interface UserAccount {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  plan?: string | null;
  currency: string;
  credits: number;
  maxBuilds: number;
  buildsCount: number;
}

interface HomeSummary {
  id: string;
  title: string;
  builder?: string | null;
  status: string;
  storeys: number;
  unit: string;
  updatedAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [homes, setHomes] = useState<HomeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Rename home state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Support / Help with a home or payment state
  const [supportTarget, setSupportTarget] = useState('');
  const [supportIssue, setSupportIssue] = useState<'conversion' | 'help' | 'refund'>('help');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportFiles, setSupportFiles] = useState<File[]>([]);
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const [inboxItems, setInboxItems] = useState<
    Array<{ id: string; subject: string; message: string; status: string; createdAt: string }>
  >([]);

  // Security & password state
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  async function loadAccount() {
    setLoading(true);
    try {
      const [sessionRes, liveRes, inboxRes] = await Promise.all([
        fetch('/api/commerce/session'),
        fetch('/api/live'),
        fetch('/api/commerce/inbox'),
      ]);
      const sessionData = await sessionRes.json();
      const liveData = await liveRes.json();
      const inboxData = inboxRes.ok ? await inboxRes.json() : { messages: [] };

      if (sessionData?.authenticated && sessionData?.user) {
        setUser(sessionData.user);
      } else {
        setUser(null);
      }
      setHomes(liveData?.homes || []);
      setInboxItems(inboxData?.messages || []);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccount();
  }, []);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim()) {
      setAuthError('Enter your email address.');
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
        setAuthError(data.error || 'Could not send code.');
      } else {
        setOtpSent(true);
        if (data.devCode) {
          setDevCode(data.devCode);
          setOtpCode(data.devCode);
        }
      }
    } catch {
      setAuthError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/commerce/auth/code-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode,
          invitationCode: invitationCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Verification failed.');
      } else {
        await loadAccount();
      }
    } catch {
      setAuthError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await fetch('/api/commerce/session', { method: 'DELETE' });
    await signOut({ redirect: false }).catch(() => {});
    setUser(null);
    setHomes([]);
  }

  async function handleChangePlan(plan: 'month' | 'year' | 'one_build') {
    setStatusMessage(null);
    const res = await fetch('/api/commerce/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, currency: user?.currency || 'AUD' }),
    });
    if (res.ok) {
      setStatusMessage(`Plan updated to ${plan}.`);
      await loadAccount();
    }
  }

  async function handleRenameHome(homeId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!renameValue.trim()) return;
    const res = await fetch(`/api/live/${encodeURIComponent(homeId)}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: renameValue.trim() }),
    });
    if (res.ok) {
      setRenamingId(null);
      setStatusMessage(`Renamed home to "${renameValue.trim()}".`);
      await loadAccount();
    }
  }

  async function handleSubmitSupport(e: React.FormEvent) {
    e.preventDefault();
    setSupportNotice(null);
    for (const f of supportFiles) {
      const fd = new FormData();
      fd.set('file', f, f.name);
      await fetch('/api/commerce/support/drawings', { method: 'POST', body: fd });
    }
    const res = await fetch('/api/commerce/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: `${supportIssue}: ${supportTarget || 'General'}`,
        message: supportMessage || 'Support inquiry',
      }),
    });
    if (res.ok) {
      setSupportNotice(
        supportFiles.length > 0
          ? 'Your files are with us. We’ll look at them and reply here and in your notifications.'
          : 'Your message is saved. Replies will appear here and in your notifications.'
      );
      setSupportMessage('');
      setSupportFiles([]);
      await loadAccount();
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordNotice(null);
    const res = await fetch('/api/commerce/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordNotice(data.message || 'Password updated.');
      setNewPassword('');
    } else {
      setPasswordNotice(data.error || 'Could not update password.');
    }
  }

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '56px 24px 80px', maxWidth: '1040px' }}>
        <span className="rl-eyebrow">ACCOUNT & WORKSPACE</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '12px' }}>
          Your Homistry account
        </h1>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Checking session...</p>
        ) : !user ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '28px',
              marginTop: '24px',
            }}
          >
            <div className="rl-card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>
                Sign in with a 6-digit email code
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                Existing members can sign in with a one-time verification code. New members
                require a valid invitation code.
              </p>

              {authError && (
                <div
                  role="alert"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#FDF2F0',
                    border: '1px solid #E5A99C',
                    color: '#8E2B18',
                    fontSize: '0.9rem',
                    marginBottom: '16px',
                  }}
                >
                  {authError}
                </div>
              )}

              <form
                onSubmit={otpSent ? handleVerifyCode : handleRequestCode}
                style={{ display: 'grid', gap: '14px' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email address
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
                    Invitation code (required if registering a new account)
                  </label>
                  <input
                    type="text"
                    className="rl-input"
                    placeholder="HM-XXXX-XXXX"
                    value={invitationCode}
                    onChange={e => setInvitationCode(e.target.value.toUpperCase())}
                  />
                </div>

                {otpSent && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                      6-digit verification code
                    </label>
                    <input
                      type="text"
                      className="rl-input"
                      placeholder="123456"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      required
                    />
                    {devCode && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--accent-forest)', marginTop: '6px' }}>
                        Verification code: <strong>{devCode}</strong>
                      </p>
                    )}
                  </div>
                )}

                <button type="submit" className="rl-btn rl-btn-primary" disabled={submitting}>
                  {submitting
                    ? 'Please wait...'
                    : otpSent
                      ? 'Verify code & sign in →'
                      : 'Send sign-in code →'}
                </button>
              </form>
            </div>

            <div className="rl-card-tinted">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>New to Homistry?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                Registration is invite-only. If you have an invitation code from your builder,
                architect, or administrator, head to the sign-up page to choose your plan.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Link href="/signup" className="rl-btn rl-btn-primary">
                  Register with invite code →
                </Link>
                <Link href="/demo/try" className="rl-btn rl-btn-secondary">
                  Explore the 3D Demo
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '28px', marginTop: '24px' }}>
            {statusMessage && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#EDF5F0',
                  border: '1px solid #A3C6B1',
                  color: '#204B32',
                }}
              >
                {statusMessage}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <div className="rl-card">
                <div className="rl-eyebrow">SIGNED IN AS</div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{user.email}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="rl-badge">Role: {user.role}</span>
                  <span className="rl-badge">Status: {user.status}</span>
                  <span className="rl-badge">Plan: {user.plan || 'Free preview'}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Active builds: <strong>{user.buildsCount}</strong> / {user.maxBuilds} ·
                  Photoreal render credits: <strong>{user.credits}</strong>
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="rl-btn rl-btn-primary">
                      Open Admin Governance →
                    </Link>
                  )}
                  <a
                    href="/api/commerce/account/export"
                    download
                    className="rl-btn rl-btn-secondary"
                  >
                    Export my data (JSON)
                  </a>
                  <button
                    type="button"
                    className="rl-btn rl-btn-secondary"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              </div>

              <div className="rl-card">
                <div className="rl-eyebrow">PLAN & CREDITS</div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
                  Manage subscription
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Switch plans or top up photorealistic render credits immediately.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    className="rl-btn rl-btn-secondary"
                    onClick={() => handleChangePlan('one_build')}
                  >
                    One-off build
                  </button>
                  <button
                    type="button"
                    className="rl-btn rl-btn-secondary"
                    onClick={() => handleChangePlan('month')}
                  >
                    Monthly pass
                  </button>
                  <button
                    type="button"
                    className="rl-btn rl-btn-primary"
                    onClick={() => handleChangePlan('year')}
                  >
                    Upgrade to Yearly
                  </button>
                </div>
              </div>
            </div>

            <div className="rl-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div className="rl-eyebrow">YOUR 3D HOMES</div>
                  <h2 style={{ fontSize: '1.5rem' }}>Floor plan builds ({homes.length})</h2>
                </div>
                <Link href="/build/new" className="rl-btn rl-btn-primary">
                  + Upload a new floor plan
                </Link>
              </div>

              {homes.length === 0 ? (
                <div className="rl-card-tinted" style={{ textAlign: 'center', padding: '36px' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                    You have not uploaded any floor plans yet. Upload a PNG, JPEG, WebP, SVG, or
                    PDF floor plan to build your first 3D home, or try the Southern Farmhouse
                    demo.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <Link href="/build/new" className="rl-btn rl-btn-primary">
                      Upload a floor plan →
                    </Link>
                    <Link href="/demo/try" className="rl-btn rl-btn-secondary">
                      Open Southern Farmhouse Demo
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {homes.map(home => (
                    <div key={home.id} className="rl-card-tinted">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className="rl-badge">{home.storeys === 2 ? 'Two-storey' : 'Single-storey'}</span>
                        <span className="rl-badge">{home.status}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{home.title}</h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Updated {new Date(home.updatedAt).toLocaleDateString()} · #{home.id.slice(0, 8)}
                      </p>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <Link
                          href={`/build?id=${home.id}`}
                          className="rl-btn rl-btn-primary"
                          style={{ width: '100%' }}
                        >
                          Open in 3D Studio →
                        </Link>
                        <button
                          type="button"
                          className="rl-btn rl-btn-secondary"
                          onClick={() => {
                            setSupportTarget(`build:${home.id}`);
                            document.getElementById('support-heading')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Get help with this home
                        </button>
                        <details
                          open={renamingId === home.id}
                          onToggle={e => {
                            if ((e.currentTarget as HTMLDetailsElement).open) {
                              setRenamingId(home.id);
                              setRenameValue(home.title);
                            }
                          }}
                        >
                          <summary style={{ cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, padding: '4px 0' }}>
                            Rename home
                          </summary>
                          <form
                            onSubmit={e => handleRenameHome(home.id, e)}
                            style={{ display: 'flex', gap: '8px', marginTop: '8px' }}
                          >
                            <input
                              type="text"
                              aria-label="Home name"
                              className="rl-input"
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              maxLength={80}
                              required
                            />
                            <button type="submit" className="rl-btn rl-btn-secondary">
                              Save name
                            </button>
                          </form>
                        </details>
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/build/new"
                    data-testid="add-another-home"
                    className="rl-card-tinted"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      textDecoration: 'none',
                      color: 'inherit',
                      borderStyle: 'dashed',
                    }}
                  >
                    <strong style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                      + Add another home
                    </strong>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Upload plans, check, then pay
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Purchases & Receipts Section */}
            <section aria-labelledby="purchases-heading" className="rl-card">
              <div className="rl-eyebrow">BILLING & RECEIPTS</div>
              <h2 id="purchases-heading" style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
                Purchases ({user.plan ? 1 : 0})
              </h2>
              {user.plan ? (
                <div className="rl-card-tinted" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong>Homistry {user.plan} plan</strong>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Reference #{user.id.slice(0, 8)} · Currency: {user.currency}
                    </div>
                  </div>
                  <span className="rl-badge">Paid</span>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  No completed purchases yet. Creating an account is free; you only pay when you build a home.
                </p>
              )}
            </section>

            {/* Support & File Attachments Section (#support-heading) */}
            <section aria-labelledby="support-heading" className="rl-card">
              <div className="rl-eyebrow">SUPPORT & CONVERSION HELP</div>
              <h2 id="support-heading" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                Help with a home or payment
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                If a wall, stair, or roof needs fixing, tell us below and attach your floor plan files.
              </p>

              {supportNotice && (
                <div
                  role="status"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#EDF5F0',
                    marginBottom: '16px',
                    fontSize: '0.9rem',
                  }}
                >
                  {supportNotice}
                </div>
              )}

              <form onSubmit={handleSubmitSupport} style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                    Which home or purchase
                    <select
                      className="rl-input"
                      value={supportTarget}
                      onChange={e => setSupportTarget(e.target.value)}
                    >
                      <option value="">General account question</option>
                      {homes.map((h, idx) => (
                        <option key={h.id} value={`build:${h.id}`}>
                          {h.title || `My home ${idx + 1}`} (#{h.id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                    What do you need help with?
                    <select
                      className="rl-input"
                      value={supportIssue}
                      onChange={e =>
                        setSupportIssue(e.target.value as 'conversion' | 'help' | 'refund')
                      }
                    >
                      <option value="conversion">Conversion problem</option>
                      <option value="help">Help with my home</option>
                      <option value="refund">Refund request</option>
                    </select>
                  </label>
                </div>

                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                  Tell us what happened
                  <textarea
                    className="rl-input"
                    rows={3}
                    placeholder="Describe any room, stair, or roof detail you would like adjusted..."
                    value={supportMessage}
                    onChange={e => setSupportMessage(e.target.value)}
                    required
                  />
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
                    Files for this home (optional · up to 8 files)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.dwg,.dxf,.docx"
                    onChange={e =>
                      setSupportFiles(Array.from(e.target.files || []).slice(0, 8))
                    }
                  />
                </div>

                <button type="submit" className="rl-btn rl-btn-primary" style={{ justifySelf: 'start' }}>
                  {supportFiles.length > 0
                    ? `Send ${supportFiles.length} file(s) & message`
                    : 'Send message to support'}
                </button>
              </form>

              {inboxItems.length > 0 && (
                <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Conversation history ({inboxItems.length})</strong>
                  {inboxItems.map(item => (
                    <div key={item.id} className="rl-card-tinted" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                        <strong>{item.subject}</strong>
                        <span className="rl-badge">{item.status}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Account Security & Connected Sign-in Accounts */}
            <section aria-labelledby="security-heading" className="rl-card">
              <div className="rl-eyebrow">ACCOUNT & SECURITY</div>
              <h2 id="security-heading" style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
                Connected sign-in accounts & password
              </h2>
              {passwordNotice && (
                <div
                  role="status"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#EDF5F0',
                    marginBottom: '12px',
                    fontSize: '0.88rem',
                  }}
                >
                  {passwordNotice}
                </div>
              )}
              <form
                onSubmit={handleChangePassword}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}
              >
                <label style={{ fontSize: '0.86rem', fontWeight: 600, flex: '1 1 240px' }}>
                  New password (use at least 7 characters)
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="rl-input"
                      placeholder="New password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      minLength={7}
                      required
                    />
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                <button type="submit" className="rl-btn rl-btn-secondary">
                  Change password and sign out other devices
                </button>
              </form>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Need to remove your personal data? Visit{' '}
                <Link href="/data-deletion" style={{ textDecoration: 'underline' }}>
                  Deleting your data
                </Link>
                .
              </div>
            </section>
          </div>
        )}
      </div>
    </SiteChrome>
  );
}
