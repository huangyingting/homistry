'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

const SYMBOL_GROUPS = [
  {
    id: 'all',
    label: 'All symbols',
    title: 'Complete Working Drawing Legend',
    explanation:
      'An architectural floor plan is a horizontal slice taken roughly 1.2 metres above the slab. Thick pochéd lines represent structural walls, arcs indicate hinged door swings, and parallel strokes mark glazed windows.',
  },
  {
    id: 'doors',
    label: 'Doors',
    title: 'Hinged, Cavity Slider & Stacker Doors',
    explanation:
      'A quarter-circle arc shows which way a hinged door swings and which wall the light switch must live on. Cavity sliders tuck inside a pocket wall—meaning you cannot put power points or plumbing inside that stud bay.',
  },
  {
    id: 'windows',
    label: 'Windows',
    title: 'Awning, Sliding & Highlight Windows',
    explanation:
      'Numbers like 1810 × 1200 indicate 1810 mm height by 1200 mm width. Highlight windows sit high on the wall (typically 1800 mm sill height) so you can still place a bedhead or vanity underneath.',
  },
  {
    id: 'stairs',
    label: 'Stairs & levels',
    title: 'Stair Flights, UP Arrows & Cut Lines',
    explanation:
      'An arrow labelled UP always points from the lower landing toward the upper storey. A diagonal break line shows where the stair climbs above the 1.2 m horizontal cut plane.',
  },
  {
    id: 'joinery',
    label: 'Joinery & plumbing',
    title: 'Kitchen Islands, Robes, Showers & Appliances',
    explanation:
      'Dashed lines along a kitchen island indicate the 300 mm breakfast-bar overhang. Crossed rectangles show tiled shower recesses grading toward a floor waste.',
  },
  {
    id: 'dimensions',
    label: 'Dimensions',
    title: 'Internal Room Sizes vs Structural Grid Strings',
    explanation:
      'Outer dimension strings measure brick-to-brick or frame-to-frame. Always check internal clear room dimensions after subtracting 90 mm stud walls and 600 mm wardrobe depths.',
  },
];

export default function HowToReadFloorPlanGuidePage() {
  const [activeGroup, setActiveGroup] = useState(SYMBOL_GROUPS[0]);

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '56px 24px 80px', maxWidth: '980px' }}>
        <Link
          href="/guides"
          style={{ display: 'inline-block', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}
        >
          ← Back to all guides
        </Link>

        <span className="rl-eyebrow">ARCHITECTURAL PLAN READING GUIDE</span>
        <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', marginBottom: '14px' }}>
          How to read a floor plan (and spot what the brochure hides)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.06rem', marginBottom: '32px' }}>
          Click through the symbol categories below to inspect the Corbel House ground-floor
          plan and decode every architectural notation before you sign off on working
          drawings.
        </p>

        <div className="rl-card" style={{ marginBottom: '36px' }}>
          <span className="rl-eyebrow">INTERACTIVE FLOOR PLAN DECODER · CORBEL HOUSE</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0 20px' }}>
            {SYMBOL_GROUPS.map(group => (
              <button
                key={group.id}
                type="button"
                className={`rl-btn ${
                  activeGroup.id === group.id ? 'rl-btn-primary' : 'rl-btn-secondary'
                }`}
                onClick={() => setActiveGroup(group)}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div
            className="rl-card-tinted"
            style={{ marginBottom: '20px', borderLeft: '4px solid var(--accent-forest)' }}
          >
            <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{activeGroup.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>
              {activeGroup.explanation}
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-sand)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <img
              src="/site/guides/corbel-house-ground-floor.svg"
              alt="Corbel House Ground Floor Architectural Plan"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <div className="rl-card-tinted" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              Ready to see your own floor plan in 3D?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Drop in your PDF or image plan to walk through every doorway and check clearances at 1:1 scale.
            </p>
          </div>
          <Link href="/build/new" className="rl-btn rl-btn-primary">
            Upload your floor plan →
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
