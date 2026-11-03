'use client';

import React from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';

export default function DemoShowcasePage() {
  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '48px 24px 80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '28px',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <p className="rl-eyebrow">Try it for yourself</p>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', marginBottom: '12px' }}>
              Explore a home.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.06rem', lineHeight: 1.6 }}>
              A real house plan, built into 3D. Turn it around, look at each floor, or walk
              through it at eye level. Then furnish it, choose its finishes and change its
              walls yourself: nothing is saved, so every visitor starts with the same empty
              house.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/demo/try"
              data-testid="demo-try"
              className="rl-btn rl-btn-secondary"
            >
              Furnish and change it yourself
            </Link>
            <Link href="/signup" className="rl-btn rl-btn-primary">
              Create my 3D home →
            </Link>
          </div>
        </div>

        <section
          aria-label="Interactive real floorplan demonstration"
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid var(--border-sand)',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(24,24,22,0.08)',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-sand)',
              background: '#FAF8F5',
            }}
          >
            <div>
              <span className="rl-eyebrow" style={{ marginBottom: '2px', display: 'block' }}>
                A real floor plan, brought to life
              </span>
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Southern Farmhouse</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                House Plans Helper · 2 storeys
              </p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: '#ECE8DF',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              Interactive 3D
            </span>
          </div>

          <div style={{ height: '640px', position: 'relative', overflow: 'hidden' }}>
            <StudioWorkspace isDemo initialTitle="Southern Farmhouse" />
          </div>

          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-sand)',
              background: '#FAF8F5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              Drag to rotate · scroll to zoom. Keyboard: ← → to rotate, + − to zoom, Escape to
              skip the build.
            </span>

            <details style={{ cursor: 'pointer' }}>
              <summary style={{ fontWeight: 700, color: 'var(--text-ink)' }}>
                About this example
              </summary>
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-sand)',
                  maxWidth: '560px',
                }}
              >
                <p style={{ margin: '0 0 8px' }}>
                  A saved reconstruction of a real two-storey plan. The ground floor builds
                  first, then the upper floor, before the house comes together. This replay
                  demonstrates the experience; it is not a new conversion.
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>
                  Southern Farmhouse plan courtesy of House Plans Helper (CC BY-SA 4.0).
                </p>
              </div>
            </details>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <div className="rl-card">
            <span className="rl-eyebrow">PAGE 01 · GROUND FLOOR</span>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>
              Great Room, Kitchen, Dining, Master Suite & Porches
            </h2>
            <img
              src="/demos/southern-farmhouse/page-1.png"
              alt="Southern Farmhouse, original ground floor drawing"
              style={{
                width: '100%',
                borderRadius: '10px',
                border: '1px solid var(--border-sand)',
              }}
            />
          </div>

          <div className="rl-card">
            <span className="rl-eyebrow">PAGE 02 · UPPER FLOOR</span>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>
              Upstairs Bedrooms, Bathrooms, Bonus Room & Loft
            </h2>
            <img
              src="/demos/southern-farmhouse/page-2.png"
              alt="Southern Farmhouse, original upper floor drawing"
              style={{
                width: '100%',
                borderRadius: '10px',
                border: '1px solid var(--border-sand)',
              }}
            />
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}

