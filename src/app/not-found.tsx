import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

export default function NotFoundPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '72px 24px 96px', maxWidth: '880px' }}>
        <span className="rl-eyebrow">PAGE NOT FOUND · 404</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', marginBottom: '12px' }}>
          THIS PAGE DOESN’T EXIST
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.08rem', marginBottom: '36px' }}>
          The link may be old or mistyped. One of these will get you back on track.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          <Link href="/" className="rl-card" style={{ display: 'block' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>HOME</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              The Homistry.ai home page
            </p>
          </Link>
          <Link href="/account" className="rl-card" style={{ display: 'block' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>MY HOMES</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Sign in and open your saved homes
            </p>
          </Link>
          <Link href="/contact" className="rl-card" style={{ display: 'block' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>HELP</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Ask us anything, no account needed
            </p>
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
