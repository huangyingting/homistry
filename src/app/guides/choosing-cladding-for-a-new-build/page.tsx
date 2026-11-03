'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

const CLADDINGS = [
  {
    id: 'weatherboard',
    label: 'Weatherboard',
    cost: '$$',
    maintenance: 'Medium (repaint every 10–12 yrs)',
    thermal: 'High with insulated stud frame',
    wallColor: '#EAE4DC',
    pattern: 'repeating-linear-gradient(0deg, #EAE4DC, #EAE4DC 14px, #D6CFC4 15px)',
    notes:
      'Classic horizontal shadow lines that suit coastal, Hamptons, and Australian country homesteads.',
  },
  {
    id: 'brick',
    label: 'Brick',
    cost: '$$',
    maintenance: 'Very low (50+ yr lifespan)',
    thermal: 'High thermal mass',
    wallColor: '#B86B52',
    pattern: 'repeating-linear-gradient(0deg, #B86B52, #B86B52 12px, #9E553E 14px)',
    notes:
      'Durable brick veneer with strong acoustic insulation and minimal upkeep over decades.',
  },
  {
    id: 'render',
    label: 'Render',
    cost: '$$$',
    maintenance: 'Medium (wash & recoat)',
    thermal: 'High when paired with EPS/AAC panels',
    wallColor: '#EFECE6',
    pattern: 'linear-gradient(135deg, #F3F0EA 0%, #E5E0D5 100%)',
    notes:
      'Crisp monolithic planes ideal for contemporary facades and curved architectural masonry.',
  },
  {
    id: 'timber',
    label: 'Vertical timber',
    cost: '$$$$',
    maintenance: 'High (oil every 12–24 mos or silver-off)',
    thermal: 'Naturally insulating renewable cladding',
    wallColor: '#A6754B',
    pattern: 'repeating-linear-gradient(90deg, #A6754B, #A6754B 12px, #875C37 14px)',
    notes:
      'Warm architectural character; often used as feature panelling around entries and upper gables.',
  },
  {
    id: 'stone',
    label: 'Stone',
    cost: '$$$$',
    maintenance: 'Very low',
    thermal: 'Exceptional thermal mass',
    wallColor: '#9C958B',
    pattern: 'repeating-linear-gradient(45deg, #9C958B, #9C958B 18px, #857E74 20px)',
    notes:
      'Anchors chimneys, entry blades, and plinth walls with natural texture.',
  },
  {
    id: 'metal',
    label: 'Metal',
    cost: '$$$',
    maintenance: 'Low (pre-finished Colorbond/zinc)',
    thermal: 'Requires thermal break battens',
    wallColor: '#3B4245',
    pattern: 'repeating-linear-gradient(90deg, #3B4245, #3B4245 18px, #272C2E 20px)',
    notes:
      'Standing-seam or corrugated profiles offering sharp modern shadow lines and bushfire resilience.',
  },
];

const TRIMS = [
  { id: 'white', label: 'Crisp white', hex: '#FAF8F5' },
  { id: 'charcoal', label: 'Charcoal', hex: '#28292B' },
  { id: 'warm-grey', label: 'Warm grey', hex: '#8F8980' },
  { id: 'eucalypt', label: 'Deep eucalypt', hex: '#3B4B44' },
];

export default function ChoosingCladdingGuidePage() {
  const [selectedCladding, setSelectedCladding] = useState(CLADDINGS[0]);
  const [selectedTrim, setSelectedTrim] = useState(TRIMS[0]);

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '56px 24px 80px', maxWidth: '980px' }}>
        <Link
          href="/guides"
          style={{ display: 'inline-block', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}
        >
          ← Back to all guides
        </Link>

        <span className="rl-eyebrow">EXTERIOR CLADDING GUIDE</span>
        <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', marginBottom: '14px' }}>
          Choosing exterior cladding for a new build
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.06rem', marginBottom: '36px' }}>
          Your façade material shapes street appeal, bushfire rating, acoustic performance,
          and how often you’ll be up a ladder with a paintbrush. Use the interactive
          comparison widget below to test combinations.
        </p>

        <div className="rl-card" style={{ marginBottom: '40px' }}>
          <span className="rl-eyebrow">INTERACTIVE CLADDING & TRIM VISUALIZER</span>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '16px' }}>
            Compare wall cladding profiles and window/fascia trim
          </h2>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {CLADDINGS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`rl-btn ${
                  selectedCladding.id === item.id ? 'rl-btn-primary' : 'rl-btn-secondary'
                }`}
                onClick={() => setSelectedCladding(item)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Trim & window frames:</span>
            {TRIMS.map(trim => (
              <button
                key={trim.id}
                type="button"
                className={`rl-btn ${
                  selectedTrim.id === trim.id ? 'rl-btn-primary' : 'rl-btn-secondary'
                }`}
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                onClick={() => setSelectedTrim(trim)}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: trim.hex,
                    border: '1px solid #999',
                    display: 'inline-block',
                  }}
                />
                {trim.label}
              </button>
            ))}
          </div>

          {/* Architectural Elevation SVG Preview */}
          <div
            style={{
              borderRadius: '12px',
              padding: '32px 24px',
              background: 'linear-gradient(180deg, #DCE6EC 0%, #F2EFE9 75%, #C7C2B8 75%)',
              border: '1px solid var(--border-sand)',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                maxWidth: '480px',
                margin: '0 auto',
                background: selectedCladding.pattern,
                border: `6px solid ${selectedTrim.hex}`,
                borderRadius: '6px',
                height: '210px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '20px',
                boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
              }}
            >
              <div
                style={{
                  width: '110px',
                  height: '95px',
                  background: '#89A7B8',
                  border: `6px solid ${selectedTrim.hex}`,
                }}
              />
              <div
                style={{
                  width: '68px',
                  height: '135px',
                  background: '#4A3B31',
                  border: `6px solid ${selectedTrim.hex}`,
                  alignSelf: 'flex-end',
                }}
              />
              <div
                style={{
                  width: '110px',
                  height: '95px',
                  background: '#89A7B8',
                  border: `6px solid ${selectedTrim.hex}`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >
            <div className="rl-card-tinted" style={{ padding: '14px' }}>
              <div className="rl-eyebrow">SELECTED CLADDING</div>
              <strong>{selectedCladding.label}</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedCladding.notes}
              </p>
            </div>
            <div className="rl-card-tinted" style={{ padding: '14px' }}>
              <div className="rl-eyebrow">RELATIVE COST & UPKEEP</div>
              <strong>Cost: {selectedCladding.cost}</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Maintenance: {selectedCladding.maintenance}
              </p>
            </div>
            <div className="rl-card-tinted" style={{ padding: '14px' }}>
              <div className="rl-eyebrow">THERMAL PERFORMANCE</div>
              <strong>{selectedCladding.thermal}</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Trim: {selectedTrim.label}
              </p>
            </div>
          </div>
        </div>

        <div className="rl-card-tinted" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              Want to see these claddings on your own floor plan?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Open the Decorate tab in the 3D Studio to switch exterior walls and roof materials live.
            </p>
          </div>
          <Link href="/demo/try" className="rl-btn rl-btn-primary">
            Try it in the 3D Studio →
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
