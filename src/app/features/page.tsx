import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

const FEATURES = [
  {
    slug: 'walkthrough',
    eyebrow: '01 · WALK-THROUGH',
    title: 'WALK-THROUGH',
    summary:
      'Upload your floor plans and walk through every room and storey of your new home in 3D, at eye level, in your browser. No app to install.',
    image: '/site/ridgeline/stills/inside-desk.webp',
  },
  {
    slug: 'exterior-finishes',
    eyebrow: '02 · EXTERIOR FINISHES',
    title: 'EXTERIOR FINISHES',
    summary:
      'Try render, brick, weatherboard, timber, stone and panel cladding on your own house in 3D, floor by floor or wall by wall, with the roof material and colour.',
    image: '/site/ridgeline/stills/outside-desk.webp',
  },
  {
    slug: 'kitchens-and-cabinetry',
    eyebrow: '03 · KITCHENS & CABINETRY',
    title: 'KITCHENS & CABINETRY',
    summary:
      'Design kitchens, islands, laundries, vanities and built-in robes at true size on your own floor plan, with benchtops, fronts, bulkheads and appliances.',
    image: '/site/ridgeline/stills/kitchen-desk.webp',
  },
  {
    slug: 'furniture',
    eyebrow: '04 · FURNITURE TO SCALE',
    title: 'FURNITURE TO SCALE',
    summary:
      'Place beds by mattress size, sofas, tables and appliances in your new home at their real dimensions, and see whether everything fits before you buy.',
    image: '/site/ridgeline/stills/furniture-desk.webp',
  },
  {
    slug: 'electrical-plans',
    eyebrow: '05 · ELECTRICAL PLANS',
    title: 'ELECTRICAL PLANS',
    summary:
      'Mark power points, switches, lights, data and fans on your own floor plan, and get a clear layout sheet and schedule to talk through with your electrician.',
    image: '/site/ridgeline/pr/card-elec.jpg',
  },
  {
    slug: 'photoreal-renders',
    eyebrow: '06 · PHOTOREAL IMAGES',
    title: 'PHOTOREAL IMAGES',
    summary:
      'Pick any view of your 3D home and turn it into a lifelike image with your AI credits: share it with family or keep it to compare options.',
    image: '/site/ridgeline/stills/photoreal-desk.webp',
  },
  {
    slug: 'sun-study',
    eyebrow: '07 · SUN STUDY',
    title: 'SUN STUDY',
    summary:
      'Put your home where it will stand and watch the sun move over it. See which rooms get morning light, where afternoon sun lands, and winter vs summer.',
    image: '/site/ridgeline/pr/card-sun.jpg',
  },
  {
    slug: 'sharing',
    eyebrow: '08 · SHARING',
    title: 'SHARING',
    summary:
      'Send a link and the people you choose can walk through your home on their own phone or computer, no account needed. They can look, but never edit.',
    image: '/site/ridgeline/pr/card-walk.jpg',
  },
];

export default function FeaturesIndexPage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px' }}>
        <span className="rl-eyebrow">FEATURES</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
          EVERYTHING YOU CAN DO WITH YOUR HOME
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            maxWidth: '680px',
            marginBottom: '48px',
          }}
        >
          Your floor plans become a 3D home. From there, every tool works on your own house,
          at its real size.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {FEATURES.map(feat => (
            <Link
              key={feat.slug}
              href={`/features/${feat.slug}`}
              className="rl-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <img
                  src={feat.image}
                  alt={feat.title}
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 10',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '18px',
                    border: '1px solid var(--border-sand)',
                  }}
                />
                <span className="rl-eyebrow">{feat.eyebrow}</span>
                <h2 style={{ fontSize: '1.45rem', marginBottom: '10px' }}>{feat.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>
                  {feat.summary}
                </p>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--accent-forest)', fontSize: '0.9rem' }}>
                Read deep-dive →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </SiteChrome>
  );
}
