'use client';

import React, { useState } from 'react';
import { SiteChrome } from '@/components/SiteChrome';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Question about my floor plan');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/commerce/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to send message.');
    } else {
      setSent(true);
      setMessage('');
    }
  }

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px', maxWidth: '760px' }}>
        <span className="rl-eyebrow">CONTACT & SUPPORT</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '12px' }}>
          Talk to the people who build Homistry.
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Need an invitation code for your build, help with a tricky multi-level split plan,
          or volume access for your builder/architecture practice? Send us a note below.
        </p>

        <div className="rl-card">
          {sent ? (
            <div style={{ padding: '20px 0' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                Thanks — we have received your message.
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                Your support thread has been logged and our team in Melbourne will reply by
                email.
              </p>
              <button
                type="button"
                className="rl-btn rl-btn-secondary"
                onClick={() => setSent(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              {error && (
                <div style={{ padding: '12px', background: '#FDF2F0', color: '#8E2B18', borderRadius: '8px' }}>
                  {error}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                  Your name
                </label>
                <input
                  type="text"
                  className="rl-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Taylor"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                  Email address *
                </label>
                <input
                  type="email"
                  className="rl-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                  Topic
                </label>
                <input
                  type="text"
                  className="rl-input"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea
                  className="rl-input"
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us about your floor plan or project..."
                  required
                />
              </div>
              <button type="submit" className="rl-btn rl-btn-primary">
                Send message →
              </button>
            </form>
          )}
        </div>
      </div>
    </SiteChrome>
  );
}
