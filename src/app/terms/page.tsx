import { SiteChrome } from '@/components/SiteChrome';

export default function TermsPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px', maxWidth: '800px' }}>
        <span className="rl-eyebrow">LEGAL · TERMS OF SERVICE</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
          Terms of Service
        </h1>
        <div className="rl-card" style={{ display: 'grid', gap: '16px', color: 'var(--text-muted)' }}>
          <p>
            By registering an account with an invitation code or uploading a floor plan to
            Homistry, you agree to these Terms of Service.
          </p>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-ink)' }}>
            1. Visualization vs Structural Engineering
          </h2>
          <p>
            Homistry provides spatial 2D/3D visualization, furniture scaling, solar path
            estimation, and conceptual electrical planning. Models generated in Homistry do
            not replace certified structural engineering or licensed architectural working
            drawings.
          </p>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-ink)' }}>
            2. Invite-Only Access & Account Security
          </h2>
          <p>
            Accounts require a valid invitation code. Administrators may revoke access or
            invitation codes at any time in accordance with organizational governance policies.
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
