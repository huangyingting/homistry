'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

const CHAPTERS = [
  {
    num: '01',
    slug: 'plans',
    eyebrow: '01 · PLANS TO 3D',
    title: 'Your builder’s flat floor plan stands up in 3D.',
    body: 'Upload the PDF or a clear photo of each floor from your builder, architect or designer. Homistry reads the walls, doors, windows, stairs, room names and printed measurements across every storey.',
    deskImage: '/site/ridgeline/stills/plans-desk.webp',
    phoneImage: '/site/ridgeline/stills/plans-phone.webp',
    href: '/floor-plan-to-3d',
  },
  {
    num: '02',
    slug: 'walls',
    eyebrow: '02 · WALLS, DOORS & WINDOWS',
    title: 'Move a wall, widen a sliding door, or flip a hinge.',
    body: 'Change a wall, door, window or railing directly on your home. Adjust ceiling heights and roof shapes, and undo or compare versions any time.',
    deskImage: '/site/ridgeline/stills/walls-desk.webp',
    phoneImage: '/site/ridgeline/stills/walls-phone.webp',
    href: '/features/walkthrough',
  },
  {
    num: '03',
    slug: 'outside',
    eyebrow: '03 · EXTERIOR FINISHES',
    title: 'Try cladding, render, brick and roof colours on your own house.',
    body: 'Compare render, face brick, weatherboard, timber slats, stone and metal roof colours floor by floor or wall by wall before signing off your colour selections.',
    deskImage: '/site/ridgeline/stills/outside-desk.webp',
    phoneImage: '/site/ridgeline/stills/outside-phone.webp',
    href: '/features/exterior-finishes',
  },
  {
    num: '04',
    slug: 'inside',
    eyebrow: '04 · WALK-THROUGH & INTERIORS',
    title: 'Start at the front door and walk room to room at eye level.',
    body: 'Climb the stairs, open and shut doors the way your plan draws them, and try 18 floor materials and interior wall paints across every room or just one.',
    deskImage: '/site/ridgeline/stills/inside-desk.webp',
    phoneImage: '/site/ridgeline/stills/inside-phone.webp',
    href: '/features/walkthrough',
  },
  {
    num: '05',
    slug: 'kitchen',
    eyebrow: '05 · KITCHENS & CABINETRY',
    title: 'Design your kitchen, island, laundry and robes at true size.',
    body: 'The kitchen benches, islands, tall units, bathroom fittings and built-in robes drawn on your plan arrive at their drawn size—ready to customize benchtops, fronts, bulkheads and appliances.',
    deskImage: '/site/ridgeline/stills/kitchen-desk.webp',
    phoneImage: '/site/ridgeline/stills/kitchen-phone.webp',
    href: '/features/kitchens-and-cabinetry',
  },
  {
    num: '06',
    slug: 'furniture',
    eyebrow: '06 · FURNITURE TO SCALE',
    title: 'Place beds, sofas and dining tables at their real dimensions.',
    body: 'Will the king bed leave room to walk around? Does the dining table clear the island? Place catalogue pieces or enter your own measurements—nothing is ever shrunk to fit.',
    deskImage: '/site/ridgeline/stills/furniture-desk.webp',
    phoneImage: '/site/ridgeline/stills/furniture-phone.webp',
    href: '/features/furniture',
  },
  {
    num: '07',
    slug: 'photoreal',
    eyebrow: '07 · PHOTOREAL PICTURES',
    title: 'Turn any view of your home into a lifelike architectural photo.',
    body: 'Frame the street front, the kitchen or the living room at dusk and turn it into a photoreal image using your monthly AI credits.',
    deskImage: '/site/ridgeline/stills/photoreal-desk.webp',
    phoneImage: '/site/ridgeline/stills/photoreal-phone.webp',
    href: '/features/photoreal-renders',
  },
];

const BOX_TOOLS = [
  {
    num: '08.1',
    title: 'ELECTRICAL PLAN',
    body: 'Power points, switches, lights and data, laid out room by room, with a schedule your electrician can price.',
    image: '/site/ridgeline/pr/card-elec.jpg',
    href: '/features/electrical-plans',
    badge: 'LIGHT · POWER · SWITCH',
  },
  {
    num: '08.2',
    title: 'PHOTOREAL PICTURES',
    body: 'Turn any view of your home into a real-estate style photo. Uses AI credits.',
    image: '/site/ridgeline/pr/kitchen-b.jpg',
    href: '/features/photoreal-renders',
    badge: 'MODEL → PHOTO',
  },
  {
    num: '08.3',
    title: 'SUN ON YOUR BLOCK',
    body: 'Place the house on your real block and see sun and shadow by date and time.',
    image: '/site/ridgeline/pr/card-sun.jpg',
    href: '/features/sun-study',
    badge: '21 JUN · 4:30 PM',
  },
  {
    num: '08.4',
    title: 'SHARE WITH FAMILY',
    body: 'Send a private link. They can walk through on their phone, with no account and no editing.',
    image: '/site/ridgeline/pr/card-walk.jpg',
    href: '/features/sharing',
    badge: 'PRIVATE LINK',
  },
];

const PHOTOREAL_ROOMS = {
  living: {
    label: 'Living',
    before: '/site/ridgeline/pr/living-a.jpg',
    after: '/site/ridgeline/pr/living-b.jpg',
    caption: 'Afternoon daylight across the living room rug, fireplace, and linen sofa.',
  },
  kitchen: {
    label: 'Kitchen',
    before: '/site/ridgeline/pr/kitchen-a.jpg',
    after: '/site/ridgeline/pr/kitchen-b.jpg',
    caption: 'Island bench, pendant lighting, and oak joinery rendered from the 3D viewport.',
  },
  front: {
    label: 'Street front',
    before: '/site/ridgeline/pr/front-a.jpg',
    after: '/site/ridgeline/pr/front-b.jpg',
    caption: 'Street elevation comparing weatherboard cladding, standing-seam roofing, and porch timber.',
  },
};

const CURRENCIES: Record<string, { symbol: string; one: string; month: string; year: string }> = {
  USD: { symbol: 'US$', one: '19.99', month: '19.99', year: '99' },
  AUD: { symbol: 'A$', one: '27.99', month: '27.99', year: '149' },
  EUR: { symbol: '€', one: '19.99', month: '19.99', year: '99' },
  GBP: { symbol: '£', one: '15.99', month: '15.99', year: '79' },
};

const FAQS = [
  {
    q: 'What plans can I upload?',
    a: 'The floor plans from your builder, architect or designer: a PDF, or a clear, straight-on photo of each page. Working drawings and marketing plans both work, in metric or imperial. Include every storey so the whole house is built.',
  },
  {
    q: 'How long does it take?',
    a: 'Usually a few minutes from upload to a home you can walk through. You can watch each storey being built and answer a couple of quick questions the plans don’t show while you wait.',
  },
  {
    q: 'How much does it cost?',
    a: 'US$19.99 a month or US$99 a year; in Australia A$27.99 a month or A$149 a year; in the euro area €19.99 a month or €99 a year. It includes your home built from your plans and every tool for as long as you subscribe.',
  },
  {
    q: 'What are AI credits?',
    a: 'Each plan includes about 40 AI credits a month. They pay for AI work such as AI fixes and photoreal images. Credits renew each month and unused credits don’t carry over.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes, any time. You keep access until the end of the month or year you have paid for.',
  },
  {
    q: 'Can I build from the 3D model?',
    a: 'No. Your home is a visual model for planning, choosing finishes and imagining the space. It is not a construction drawing. Your builder’s plans and your trades’ measurements are what get built.',
  },
  {
    q: 'What if something doesn’t match my plans?',
    a: 'You can fix it yourself: remove or add walls, doors and windows, change ceiling heights and the roof shape, and undo any change. If something still looks wrong, report it from your home.',
  },
  {
    q: 'Are the kitchen and bathrooms included?',
    a: 'Yes. The kitchen benches, islands and tall units, bathroom fittings, laundry and built-in robes that your plan draws are placed at their drawn size, and you can redesign them with the cabinetry tools.',
  },
  {
    q: 'Who can see my home?',
    a: 'Only you, until you choose to share it. A share link lets people walk through the home but never edit it or see your plans. You can stop sharing at any time, and the old link stops working.',
  },
];

export default function HomePage() {
  const [activeRoom, setActiveRoom] = useState<'living' | 'kitchen' | 'front'>('kitchen');
  const [sliderPos, setSliderPos] = useState<number>(52);
  const [currency, setCurrency] = useState<string>('USD');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const pr = PHOTOREAL_ROOMS[activeRoom];
  const price = CURRENCIES[currency] || CURRENCIES.USD;

  return (
    <SiteChrome>
      {/* Chapter 00: Hero Section */}
      <section style={{ padding: '72px 0 56px' }}>
        <div className="rl-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="rl-eyebrow">
                00 · HOME / 08 · RIDGELINE HOUSE · 284 M² · 3 BED + STUDY · 2.5 BATH · 2 CAR
              </span>
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 4.8vw, 3.9rem)',
                  marginBottom: '20px',
                  lineHeight: 1.08,
                }}
              >
                SEE YOUR HOUSE STANDING BEFORE THE SLAB IS POURED.
              </h1>
              <p
                style={{
                  fontSize: '1.12rem',
                  color: 'var(--text-muted)',
                  marginBottom: '28px',
                  maxWidth: '540px',
                }}
              >
                Upload your builder’s plans. Homistry builds every storey in 3D, so you can
                walk it, choose the outside, design the kitchen and furnish it to true scale.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Link href="/signup" className="rl-btn rl-btn-primary">
                  CREATE YOUR FREE ACCOUNT →
                </Link>
                <Link href="/demo/try" className="rl-btn rl-btn-secondary">
                  SEE A LIVE EXAMPLE
                </Link>
                <Link href="/build/new" className="rl-btn rl-btn-secondary">
                  Upload your floor plan →
                </Link>
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-subtle)',
                  marginTop: '14px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                DRAG THE HOUSE TO SPIN IT · SCROLL TO BUILD · PDF, PNG, JPG, WEBP OR SVG
              </p>
            </div>

            <div
              className="rl-card"
              style={{
                padding: '14px',
                background: '#FFFFFF',
                boxShadow: '0 24px 60px rgba(31, 30, 28, 0.08)',
              }}
            >
              <picture>
                <source media="(min-width: 901px)" srcSet="/site/ridgeline/stills/home-desk.webp" />
                <img
                  src="/site/ridgeline/stills/home-desk.webp"
                  alt="Ridgeline House 3D model preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                />
              </picture>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 6px 4px',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Southern Farmhouse & Ridgeline House · Interactive 3D</span>
                <Link
                  href="/demo/try"
                  style={{ fontWeight: 600, color: 'var(--accent-forest)' }}
                >
                  Open interactive 3D Studio →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters 01–07 Architectural Tour */}
      <section style={{ padding: '48px 0' }}>
        <div className="rl-container">
          <div style={{ maxWidth: '680px', marginBottom: '40px' }}>
            <span className="rl-eyebrow">CHAPTERS 01 – 07 · STEP BY STEP</span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', marginBottom: '12px' }}>
              From flat builder sheets to a furnished 3D home.
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Every tool works on your own house, at its real size, directly in your browser.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '32px' }}>
            {CHAPTERS.map((ch, idx) => (
              <div
                key={ch.num}
                className="rl-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                  gap: '32px',
                  alignItems: 'center',
                }}
              >
                <div style={{ order: idx % 2 === 1 ? 2 : 1 }}>
                  <span className="rl-eyebrow">{ch.eyebrow}</span>
                  <h3 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', marginBottom: '14px' }}>
                    {ch.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{ch.body}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link href={ch.href} className="rl-btn rl-btn-secondary">
                      Explore {ch.num} →
                    </Link>
                    <Link href="/demo/try" className="rl-btn rl-btn-primary">
                      Try it in the demo
                    </Link>
                  </div>
                </div>
                <div style={{ order: idx % 2 === 1 ? 1 : 2 }}>
                  <picture>
                    <source media="(min-width: 901px)" srcSet={ch.deskImage} />
                    <img
                      src={ch.deskImage}
                      alt={ch.title}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        display: 'block',
                        border: '1px solid var(--border-sand)',
                      }}
                    />
                  </picture>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 08: EVERYTHING IN THE BOX (08.1 - 08.4) */}
      <section style={{ padding: '48px 0' }}>
        <div className="rl-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <span className="rl-eyebrow">08 · EVERYTHING IN THE BOX</span>
              <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)', marginBottom: '10px' }}>
                TOOLS FOR EVERY DECISION.
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                One subscription opens every tool for your home. Your AI credits renew each
                month for the heavier jobs, like photoreal pictures.
              </p>
            </div>
            <Link href="/features" className="rl-btn rl-btn-secondary">
              ALL 8 FEATURES →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {BOX_TOOLS.map(card => (
              <Link
                key={card.num}
                href={card.href}
                className="rl-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}
              >
                <div>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 10',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      marginBottom: '14px',
                      border: '1px solid var(--border-sand)',
                    }}
                  />
                  <span className="rl-eyebrow">{card.num}</span>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{card.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{card.body}</p>
                </div>
                <span className="rl-badge">{card.badge}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Photoreal A/B Slider */}
      <section style={{ padding: '56px 0', background: 'var(--bg-card)' }}>
        <div className="rl-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '28px',
            }}
          >
            <div>
              <span className="rl-eyebrow">PHOTOREALISTIC CAMERA RENDERS</span>
              <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)' }}>
                From live 3D model to real-estate style photo.
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.keys(PHOTOREAL_ROOMS) as Array<'living' | 'kitchen' | 'front'>).map(
                key => (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Show the ${PHOTOREAL_ROOMS[key].label.toLowerCase()}`}
                    className={`rl-btn ${
                      activeRoom === key ? 'rl-btn-primary' : 'rl-btn-secondary'
                    }`}
                    onClick={() => setActiveRoom(key)}
                  >
                    {PHOTOREAL_ROOMS[key].label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rl-card" style={{ padding: '18px' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '12px',
                overflow: 'hidden',
                userSelect: 'none',
                background: '#1F1E1C',
              }}
            >
              <img
                src={pr.after}
                alt={`${pr.label} photoreal render`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${sliderPos}%`,
                  overflow: 'hidden',
                  borderRight: '3px solid #FAF8F5',
                }}
              >
                <img
                  src={pr.before}
                  alt={`${pr.label} 3D studio view`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              <span
                className="rl-badge"
                style={{ position: 'absolute', top: '14px', left: '14px' }}
              >
                3D Studio View
              </span>
              <span
                className="rl-badge"
                style={{ position: 'absolute', top: '14px', right: '14px' }}
              >
                Photoreal Render
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '16px',
                flexWrap: 'wrap',
              }}
            >
              <label
                htmlFor="photoreal-slider"
                style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
              >
                COMPARE SLIDER ({sliderPos}%)
              </label>
              <input
                id="photoreal-slider"
                type="range"
                role="slider"
                aria-label="Drag to compare 3D view and photoreal render"
                min={5}
                max={95}
                value={sliderPos}
                onChange={e => setSliderPos(Number(e.target.value))}
                style={{ flex: 1, cursor: 'ew-resize' }}
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {pr.caption}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Currency Pricing Section */}
      <section style={{ padding: '64px 0' }}>
        <div className="rl-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div>
              <span className="rl-eyebrow">SIMPLE PRICING</span>
              <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)' }}>
                Less than a single power-point variation after handover.
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Currency:</span>
              <select
                aria-label="Currency selector"
                className="rl-input"
                style={{ width: 'auto', padding: '8px 14px' }}
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div className="rl-card">
              <span className="rl-eyebrow">SINGLE FLOOR PLAN</span>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>One-off build</h3>
              <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
                {price.symbol}
                {price.one}{' '}
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>once</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                Convert 1 floor plan into an interactive 3D home with 10 photoreal render
                credits and unlimited view-only share links.
              </p>
              <Link
                href={`/signup?plan=one_build&currency=${currency}`}
                className="rl-btn rl-btn-secondary"
                style={{ width: '100%' }}
              >
                Start with one build →
              </Link>
            </div>

            <div
              className="rl-card"
              style={{ border: '2px solid var(--accent-forest)' }}
            >
              <span className="rl-eyebrow" style={{ color: 'var(--accent-forest)' }}>
                MOST POPULAR · DESIGNING YOUR HOME
              </span>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Monthly pass</h3>
              <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
                {price.symbol}
                {price.month}{' '}
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                Up to 3 active home builds at once, 30 photoreal render credits each month,
                full wall editing, sun study, and electrical planner.
              </p>
              <Link
                href={`/signup?plan=month&currency=${currency}`}
                className="rl-btn rl-btn-primary"
                style={{ width: '100%' }}
              >
                Choose Monthly →
              </Link>
            </div>

            <div className="rl-card">
              <span className="rl-eyebrow">FULL BUILD JOURNEY</span>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Yearly pass</h3>
              <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
                {price.symbol}
                {price.year}{' '}
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ year</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                Up to 10 active home builds, 120 photoreal render credits per year, and
                revision history from initial sketch to pre-start sign-off.
              </p>
              <Link
                href={`/signup?plan=year&currency=${currency}`}
                className="rl-btn rl-btn-secondary"
                style={{ width: '100%' }}
              >
                Choose Yearly →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: '48px 0 32px' }}>
        <div className="rl-container" style={{ maxWidth: '820px' }}>
          <span className="rl-eyebrow">COMMON QUESTIONS</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '24px' }}>
            Questions homeowners ask before uploading.
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {FAQS.map((item, idx) => {
              const expanded = openFaq === idx;
              return (
                <div key={item.q} className="rl-card" style={{ padding: '20px 24px' }}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenFaq(expanded ? null : idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{item.q}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {expanded ? '−' : '+'}
                    </span>
                  </button>
                  {expanded && (
                    <p
                      style={{
                        marginTop: '12px',
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem',
                      }}
                    >
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
