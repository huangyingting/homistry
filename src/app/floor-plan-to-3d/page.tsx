import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

export default function FloorPlanTo3DPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '64px',
          }}
        >
          <div>
            <span className="rl-eyebrow">FLOOR PLAN TO 3D CONVERSION</span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', marginBottom: '16px' }}>
              Turn any 2D builder plan into an interactive 3D home.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.08rem', marginBottom: '28px' }}>
              Upload a PDF, PNG, JPG, WebP, or SVG floor plan. Homistry extracts walls,
              windows, doors, stairs, and room labels so you can walk through your layout in
              minutes instead of waiting weeks for an architectural render.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/build/new" className="rl-btn rl-btn-primary">
                Upload your floor plan →
              </Link>
              <Link href="/demo/try" className="rl-btn rl-btn-secondary">
                Try the Southern Farmhouse Demo
              </Link>
            </div>
          </div>

          <div className="rl-card" style={{ padding: '16px' }}>
            <img
              src="/site/ridgeline/stills/plans-desk.webp"
              alt="2D floor plan converted into a 3D home"
              style={{ width: '100%', borderRadius: '10px', display: 'block' }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              step: 'STEP 01',
              title: 'Drop in your plan files',
              body: 'Upload single-storey or two-storey drawings directly from your builder brochure or draftsperson PDF.',
            },
            {
              step: 'STEP 02',
              title: 'Set storeys, units & ceiling heights',
              body: 'Choose metres or feet & inches, confirm 2400 mm / 2700 mm ceilings, and pick your roof profile.',
            },
            {
              step: 'STEP 03',
              title: 'Walk through, furnish & share',
              body: 'Step inside at eye level, place scaled furniture, run a sun study, and share a view-only link.',
            },
          ].map(item => (
            <div key={item.step} className="rl-card">
              <span className="rl-eyebrow">{item.step}</span>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>{item.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteChrome>
  );
}
