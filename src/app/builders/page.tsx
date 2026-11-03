'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

interface BuilderHomeItem {
  id: string;
  builderName: string;
  designName: string;
  facadeName?: string | null;
  storeys: number;
  floorAreaSqm?: number | null;
  status: string;
  createdAt: string;
}

export default function BuildersPage() {
  const [homes, setHomes] = useState<BuilderHomeItem[]>([]);
  const [builderName, setBuilderName] = useState('');
  const [designName, setDesignName] = useState('');
  const [facadeName, setFacadeName] = useState('Modern Gable');
  const [storeys, setStoreys] = useState<1 | 2>(2);
  const [floorAreaSqm, setFloorAreaSqm] = useState(285);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadHomes() {
    const res = await fetch('/api/builders/homes');
    if (res.ok) {
      const data = await res.json();
      setHomes(data.homes || []);
    }
  }

  useEffect(() => {
    loadHomes();
  }, []);

  async function handleCreateDesign(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const res = await fetch('/api/builders/homes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        builderName,
        designName,
        facadeName,
        storeys,
        floorAreaSqm,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Please sign in with a Builder or Admin account.');
    } else {
      setMessage(`Added ${data.home.designName} to your 3D display catalogue.`);
      setDesignName('');
      await loadHomes();
    }
  }

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px' }}>
        <span className="rl-eyebrow">FOR HOME BUILDERS & RESIDENTIAL ARCHITECTS</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', marginBottom: '16px' }}>
          Turn every brochure floor plan into a 3D display home.
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            maxWidth: '700px',
            fontSize: '1.08rem',
            marginBottom: '36px',
          }}
        >
          Let clients walk through your entire home range at eye level, test façade claddings,
          and sign off on colour selections and electrical plans with confidence.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          <div className="rl-card">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
              Add a standard home design
            </h2>
            {message && (
              <div
                style={{
                  padding: '12px',
                  background: '#EDF5F0',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
              >
                {message}
              </div>
            )}
            {error && (
              <div
                style={{
                  padding: '12px',
                  background: '#FDF2F0',
                  color: '#8E2B18',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
              >
                {error}{' '}
                <Link href="/account" style={{ textDecoration: 'underline' }}>
                  Sign in
                </Link>
              </div>
            )}
            <form onSubmit={handleCreateDesign} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  Builder / Studio name
                </label>
                <input
                  type="text"
                  className="rl-input"
                  placeholder="Ridgeline Homes / Metricon / Custom Studio"
                  value={builderName}
                  onChange={e => setBuilderName(e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  Home design name *
                </label>
                <input
                  type="text"
                  className="rl-input"
                  placeholder="The Southern Farmhouse 32"
                  value={designName}
                  onChange={e => setDesignName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    Storeys
                  </label>
                  <select
                    className="rl-input"
                    value={storeys}
                    onChange={e => setStoreys(Number(e.target.value) === 1 ? 1 : 2)}
                  >
                    <option value={1}>Single-storey</option>
                    <option value={2}>Two-storey</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    Floor area (m²)
                  </label>
                  <input
                    type="number"
                    className="rl-input"
                    value={floorAreaSqm}
                    onChange={e => setFloorAreaSqm(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  Default façade
                </label>
                <input
                  type="text"
                  className="rl-input"
                  value={facadeName}
                  onChange={e => setFacadeName(e.target.value)}
                />
              </div>
              <button type="submit" className="rl-btn rl-btn-primary">
                Add to 3D Display Catalogue →
              </button>
            </form>
          </div>

          <div className="rl-card-tinted">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
              Active 3D display catalogue ({homes.length})
            </h2>
            {homes.length === 0 ? (
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.94rem',
                  marginBottom: '20px',
                }}
              >
                No builder catalogue designs registered in this session yet. Add a home design
                on the left or launch the Southern Farmhouse interactive display.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                {homes.map(h => (
                  <div key={h.id} className="rl-card" style={{ padding: '14px' }}>
                    <strong>{h.designName}</strong>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {h.builderName} · {h.storeys}-storey · {h.facadeName || 'Standard'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/demo/try" className="rl-btn rl-btn-secondary">
              Launch Interactive Display Home →
            </Link>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
