import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

export default function DataDeletionPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px', maxWidth: '800px' }}>
        <span className="rl-eyebrow">LEGAL · DATA DELETION & EXPORT</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
          Data Deletion Instructions
        </h1>
        <div className="rl-card" style={{ display: 'grid', gap: '16px', color: 'var(--text-muted)' }}>
          <p>
            You own the floor plans you upload and the 3D homes you design in Homistry.
          </p>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-ink)' }}>
            Self-service data export
          </h2>
          <p>
            Sign in on your <Link href="/account" style={{ textDecoration: 'underline' }}>Account page</Link> and click{' '}
            <strong>Export my data (JSON)</strong> to download your complete profile, builds,
            placed furniture, and renders.
          </p>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-ink)' }}>
            Requesting permanent account & plan deletion
          </h2>
          <p>
            Submit a deletion request via our <Link href="/contact" style={{ textDecoration: 'underline' }}>Contact Support</Link>{' '}
            form from your registered email address with the subject{' '}
            <code>Data Deletion Request</code>. All uploaded floor plan drafts, 3D builds, and
            share links are purged within 7 days.
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
