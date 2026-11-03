'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  plan?: string | null;
  credits: number;
}

export function SiteChrome({
  children,
  minimalFooter = false,
}: {
  children: React.ReactNode;
  minimalFooter?: boolean;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/commerce/session')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/guides', label: 'Guides' },
    { href: '/demo', label: 'Live example' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250, 248, 245, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-sand)',
        }}
      >
        <div
          className="rl-container"
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
            }}
          >
            <img
              src="/site/brand/homistry-mark-animated.svg"
              alt=""
              width={28}
              height={30}
              style={{ display: 'block' }}
            />
            <img
              src="/site/brand/homistry-wordmark.svg"
              alt="Homistry.ai"
              width={132}
              height={26}
              style={{ display: 'block' }}
            />
          </Link>

          <nav
            className="hide-mobile"
            aria-label="Primary"
            style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
          >
            {navLinks.map(item => {
              const active =
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontSize: '0.92rem',
                    color: active ? 'var(--text-ink)' : 'var(--text-muted)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div
            className="hide-mobile"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="rl-btn rl-btn-secondary">
                    Admin
                  </Link>
                )}
                <Link href="/account" className="rl-btn rl-btn-secondary">
                  My account
                </Link>
                <Link href="/build/new" className="rl-btn rl-btn-primary">
                  Upload a plan →
                </Link>
              </>
            ) : (
              <>
                <Link href="/account" className="rl-btn rl-btn-secondary">
                  Sign in
                </Link>
                <Link href="/signup" className="rl-btn rl-btn-secondary">
                  Create free account →
                </Link>
                <Link href="/build/new" className="rl-btn rl-btn-primary">
                  Upload a plan →
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="only-mobile rl-btn rl-btn-secondary"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            style={{ padding: '8px 14px' }}
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className="only-mobile"
            style={{
              background: 'var(--bg-paper)',
              borderBottom: '1px solid var(--border-sand)',
              padding: '16px 20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {navLinks.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1.02rem', fontWeight: 500 }}
              >
                {item.label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-sand)' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="rl-btn rl-btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="rl-btn rl-btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>
              <Link
                href="/signup"
                className="rl-btn rl-btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
              <Link
                href="/build/new"
                className="rl-btn rl-btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Upload a plan →
              </Link>
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      {!minimalFooter && (
        <footer
          style={{
            borderTop: '1px solid var(--border-sand)',
            background: 'var(--bg-card)',
            padding: '64px 0 48px',
            marginTop: '80px',
          }}
        >
          <div className="rl-container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '36px',
                marginBottom: '48px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <img src="/site/brand/homistry-mark.svg" alt="" width={24} height={26} />
                  <img src="/site/brand/homistry-wordmark.svg" alt="Homistry.ai" width={120} height={24} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Your new home in 3D, from the plans you already have. A visual model for deciding, not a construction drawing.
                </p>
              </div>

              <div>
                <h2 className="rl-eyebrow" style={{ marginBottom: '12px' }}>FEATURES</h2>
                <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', fontSize: '0.92rem' }}>
                  <li><Link href="/features">All features</Link></li>
                  <li><Link href="/features/walkthrough">Walk-through</Link></li>
                  <li><Link href="/features/exterior-finishes">Exterior finishes</Link></li>
                  <li><Link href="/features/kitchens-and-cabinetry">Kitchens & cabinetry</Link></li>
                  <li><Link href="/features/furniture">Furniture to scale</Link></li>
                  <li><Link href="/features/electrical-plans">Electrical plans</Link></li>
                  <li><Link href="/features/photoreal-renders">Photoreal images</Link></li>
                  <li><Link href="/features/sun-study">Sun study</Link></li>
                  <li><Link href="/features/sharing">Sharing</Link></li>
                </ul>
              </div>

              <div>
                <h2 className="rl-eyebrow" style={{ marginBottom: '12px' }}>GUIDES</h2>
                <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', fontSize: '0.92rem' }}>
                  <li><Link href="/floor-plan-to-3d">Floor plan to 3D: how to turn your house plans into a 3D model</Link></li>
                  <li><Link href="/guides/choosing-cladding-for-a-new-build">Choosing cladding for a new build</Link></li>
                  <li><Link href="/guides/how-to-read-a-floor-plan">How to read a floor plan</Link></li>
                  <li><Link href="/guides">All guides</Link></li>
                  <li><Link href="/guides/rss.xml">Guides feed (RSS)</Link></li>
                </ul>
              </div>

              <div>
                <h2 className="rl-eyebrow" style={{ marginBottom: '12px' }}>HOMISTRY.AI</h2>
                <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', fontSize: '0.92rem', marginBottom: '20px' }}>
                  <li><Link href="/pricing">Pricing</Link></li>
                  <li><Link href="/demo">Live example</Link></li>
                  <li><Link href="/signup">Create free account</Link></li>
                  <li><Link href="/build/new">Upload your plans</Link></li>
                  <li><Link href="/account">Sign in or My account</Link></li>
                  <li><Link href="/realestate">For realtors</Link></li>
                  <li><Link href="/contact">Help & contact</Link></li>
                </ul>
                <h2 className="rl-eyebrow" style={{ marginBottom: '12px' }}>LEGAL</h2>
                <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', fontSize: '0.92rem' }}>
                  <li><Link href="/privacy">Privacy</Link></li>
                  <li><Link href="/terms">Terms & refunds</Link></li>
                  <li><Link href="/data-deletion">Deleting your data</Link></li>
                </ul>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-sand)',
                paddingTop: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '12px',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
              }}
            >
              <span>© 2026 HOMISTRY.AI · VARIANCE PTY LTD</span>
              <span>VISUAL MODEL ONLY, NOT FOR CONSTRUCTION · INVITE-ONLY RBAC</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
