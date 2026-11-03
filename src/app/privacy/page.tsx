import { SiteChrome } from '@/components/SiteChrome';

export default function PrivacyPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px', maxWidth: '800px' }}>
        <span className="rl-eyebrow">LEGAL · PRIVACY POLICY</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
          Privacy Policy
        </h1>
        <div className="rl-card" style={{ display: 'grid', gap: '16px', color: 'var(--text-muted)' }}>
          <p>
            Homistry Pty Ltd respects your privacy. Floor plans, 3D models, furniture layouts,
            and photorealistic renders you create are private to your account unless you
            explicitly generate a share link.
          </p>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-ink)' }}>
            1. Data we collect
          </h2>
          <p>
            We collect your email address, invitation code history, uploaded floor plan files,
            3D design state, and security audit metadata (IP address and user-agent for
            authentication and administrative actions).
          </p>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-ink)' }}>
            2. Exporting & deleting your data
          </h2>
          <p>
            You can download a complete JSON archive of your account from the Account page at
            any time via <code>/api/commerce/account/export</code> or request full deletion via
            our Data Deletion page.
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
