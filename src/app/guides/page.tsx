import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

const GUIDES = [
  {
    slug: 'how-to-read-a-floor-plan',
    eyebrow: 'INTERACTIVE SYMBOL DECODER',
    title: 'How to read an architectural floor plan (before you sign off)',
    summary:
      'Learn what door swings, window sill notations, dashed bulkhead lines, stair arrows, and dimension strings actually mean on a builder’s working drawing.',
    readTime: '8 min read · Interactive Corbel House plan',
  },
  {
    slug: 'choosing-cladding-for-a-new-build',
    eyebrow: 'EXTERIOR MATERIALS & STREET APPEAL',
    title: 'Choosing exterior cladding for a new build',
    summary:
      'Compare weatherboard, face brick, smooth render, vertical timber, stone, and standing-seam metal—with an interactive façade and trim colour pairing tool.',
    readTime: '10 min read · Interactive cladding visualizer',
  },
];

export default function GuidesIndexPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px', maxWidth: '960px' }}>
        <span className="rl-eyebrow">HOMEOWNER FIELD GUIDES</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', marginBottom: '14px' }}>
          Practical guides for reading plans and choosing finishes.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.08rem', marginBottom: '40px' }}>
          Written for people building or renovating a home—with interactive diagrams so you
          can test what you read.
        </p>

        <div style={{ display: 'grid', gap: '24px' }}>
          {GUIDES.map(guide => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rl-card"
              style={{ display: 'block' }}
            >
              <span className="rl-eyebrow">{guide.eyebrow}</span>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '10px' }}>{guide.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                {guide.summary}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  {guide.readTime}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent-forest)' }}>
                  Open interactive guide →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteChrome>
  );
}
