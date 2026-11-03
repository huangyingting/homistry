'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

interface ListingFacts {
  beds: number;
  baths: number;
  cars: number;
  area: number;
  storeys: number;
}

interface ListingItem {
  id: string;
  agencyName: string;
  agentName: string;
  address: string;
  suburb?: string | null;
  state?: string | null;
  status: string;
  createdAt: string;
  addedAt?: string;
  source?: string;
  country?: string;
  place?: [number, number];
  pictures?: string[];
  facts?: ListingFacts;
}

interface RealEstateMe {
  signedIn: boolean;
  owner: boolean;
  email: string | null;
  allowed: boolean;
  access: string;
}

export default function RealEstatePage() {
  const [me, setMe] = useState<RealEstateMe | null>(null);
  const [homes, setHomes] = useState<ListingItem[]>([]);
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [beds, setBeds] = useState(4);
  const [baths, setBaths] = useState(2);
  const [cars, setCars] = useState(2);
  const [area, setArea] = useState(245);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sort & filter controls matching chunks_1958
  const [filterBeds, setFilterBeds] = useState(0);
  const [filterArea, setFilterArea] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'beds' | 'area' | 'address'>('newest');

  // Realtor Request Access form state matching chunks_1958
  const [reqName, setReqName] = useState('');
  const [reqWebsite, setReqWebsite] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqCode, setReqCode] = useState('');
  const [reqStage, setReqStage] = useState<'details' | 'code' | 'sent'>('details');
  const [reqNote, setReqNote] = useState('');
  const [reqBusy, setReqBusy] = useState(false);

  async function loadPortal() {
    try {
      const meRes = await fetch('/api/realestate/me', { cache: 'no-store' });
      if (meRes.ok) {
        const meData = await meRes.json();
        setMe(meData);
      }
      const res = await fetch('/api/realestate/homes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setHomes(data.homes || []);
      }
    } catch {
      // ignore initial load error
    }
  }

  useEffect(() => {
    loadPortal();
  }, []);

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const res = await fetch('/api/realestate/homes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, suburb, agencyName, beds, baths, cars, area }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Please sign in to create a real estate listing.');
    } else {
      setMessage(`Created interactive 3D listing for ${data.listing.address}.`);
      setAddress('');
      setSuburb('');
      await loadPortal();
    }
  }

  async function handleAskForAccess(e: React.FormEvent) {
    e.preventDefault();
    if (reqBusy) return;
    setReqBusy(true);
    try {
      const res = await fetch('/api/realestate/request/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reqName, website: reqWebsite, email: reqEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setReqStage('code');
        setReqNote(
          data.message ||
            `We sent a 6-digit code to ${reqEmail.trim()}. It works for 10 minutes.`
        );
      }
    } finally {
      setReqBusy(false);
    }
  }

  async function handleSendRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (reqBusy) return;
    setReqBusy(true);
    try {
      const res = await fetch('/api/realestate/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reqName,
          website: reqWebsite,
          email: reqEmail,
          code: reqCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReqStage('sent');
        setReqNote(
          data.message ||
            'Thanks. Your request is with us, and we’ll email you as soon as you’re in.'
        );
      }
    } finally {
      setReqBusy(false);
    }
  }

  const normalizedHomes = useMemo(() => {
    return homes.map((h, i) => ({
      ...h,
      facts: h.facts || {
        beds: 4,
        baths: 2,
        cars: 2,
        area: 245,
        storeys: 2,
      },
      addedAt: h.addedAt || h.createdAt || new Date().toISOString(),
      source: h.source || `${h.agencyName || 'Partner Agency'} (agent listing)`,
      place: h.place || ([-37.822 + i * 0.008, 145.035 + i * 0.009] as [number, number]),
    }));
  }, [homes]);

  const filteredHomes = useMemo(() => {
    const filtered = normalizedHomes.filter(
      h => h.facts.beds >= filterBeds && h.facts.area >= filterArea
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === 'beds') return b.facts.beds - a.facts.beds || b.facts.area - a.facts.area;
      if (sortBy === 'area') return b.facts.area - a.facts.area;
      if (sortBy === 'address') return a.address.localeCompare(b.address);
      return b.addedAt.localeCompare(a.addedAt);
    });
  }, [normalizedHomes, filterBeds, filterArea, sortBy]);

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '56px 24px 80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <span className="rl-eyebrow">For realtors · Homes to walk through</span>
          {me?.email && (
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                background: '#ECE8DF',
                fontSize: '0.84rem',
                fontWeight: 600,
              }}
            >
              Signed in as {me.email}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', marginBottom: '14px' }}>
          Walk through every home before you list it
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            maxWidth: '720px',
            fontSize: '1.06rem',
            marginBottom: '36px',
          }}
        >
          Each home here is a 3D model you can walk through and change: move a wall, try new
          floors, furnish it. Your changes are kept for you alone.
        </p>

        {/* Sort and Filter Toolbar matching chunks_1958 */}
        <div
          role="group"
          aria-label="Sort and filter"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '14px 18px',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid var(--border-sand)',
            marginBottom: '28px',
          }}
        >
          <strong style={{ fontSize: '0.88rem' }}>Sort and filter</strong>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            Beds
            <select
              className="rl-input"
              style={{ width: 'auto', padding: '6px 10px' }}
              value={filterBeds}
              onChange={e => setFilterBeds(Number(e.target.value))}
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            Floor area
            <select
              className="rl-input"
              style={{ width: 'auto', padding: '6px 10px' }}
              value={filterArea}
              onChange={e => setFilterArea(Number(e.target.value))}
            >
              <option value={0}>Any</option>
              {[100, 150, 200, 250, 300].map(n => (
                <option key={n} value={n}>
                  {n}+ m²
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            Sort
            <select
              className="rl-input"
              style={{ width: 'auto', padding: '6px 10px' }}
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'newest' | 'beds' | 'area' | 'address')
              }
            >
              <option value="newest">Newest</option>
              <option value="beds">Most beds</option>
              <option value="area">Largest</option>
              <option value="address">Address</option>
            </select>
          </label>

          <span
            role="status"
            style={{
              marginLeft: 'auto',
              fontSize: '0.84rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            {filteredHomes.length} of {normalizedHomes.length}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            marginBottom: '36px',
          }}
        >
          <div className="rl-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>
              Register a listing floor plan
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
            <form onSubmit={handleCreateListing} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Agency name
                </label>
                <input
                  type="text"
                  className="rl-input"
                  placeholder="Jellis Craig / Ray White / BresicWhitney"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Street address *
                </label>
                <input
                  type="text"
                  className="rl-input"
                  placeholder="42 Ridgeline Crescent"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Suburb / City
                </label>
                <input
                  type="text"
                  className="rl-input"
                  placeholder="Hawthorn VIC"
                  value={suburb}
                  onChange={e => setSuburb(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  Beds
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="rl-input"
                    value={beds}
                    onChange={e => setBeds(Number(e.target.value))}
                  />
                </label>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  Baths
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="rl-input"
                    value={baths}
                    onChange={e => setBaths(Number(e.target.value))}
                  />
                </label>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  Cars
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="rl-input"
                    value={cars}
                    onChange={e => setCars(Number(e.target.value))}
                  />
                </label>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  Area (m²)
                  <input
                    type="number"
                    min={40}
                    max={1500}
                    className="rl-input"
                    value={area}
                    onChange={e => setArea(Number(e.target.value))}
                  />
                </label>
              </div>
              <button type="submit" className="rl-btn rl-btn-primary">
                Create 3D Listing Showcase →
              </button>
            </form>
          </div>

          {/* Active 3D Property Listings + Map */}
          <div className="rl-card-tinted">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>
              Your active 3D property listings ({filteredHomes.length})
            </h2>
            {filteredHomes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '20px' }}>
                No homes match or none registered yet. Register a property on the left or try
                the Southern Farmhouse showcase.
              </p>
            ) : (
              <ol
                aria-label="Homes"
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 20px',
                  display: 'grid',
                  gap: '12px',
                }}
              >
                {filteredHomes.map((h, idx) => (
                  <li key={h.id}>
                    <Link
                      href={`/realestate/${encodeURIComponent(h.id)}`}
                      className="rl-card"
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <strong>
                          #{idx + 1} · {h.address}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: '#ECE8DF',
                            fontWeight: 700,
                          }}
                        >
                          3D walk-through
                        </span>
                      </div>
                      <ul
                        aria-label="Rooms and size"
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: '0 0 6px',
                          display: 'flex',
                          gap: '14px',
                          fontSize: '0.84rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <li>
                          <strong>{h.facts.beds}</strong> bed{h.facts.beds === 1 ? '' : 's'}
                        </li>
                        <li>
                          <strong>{h.facts.baths}</strong> bath{h.facts.baths === 1 ? '' : 's'}
                        </li>
                        <li>
                          <strong>{h.facts.cars}</strong> car{h.facts.cars === 1 ? '' : 's'}
                        </li>
                        <li>
                          <strong>{h.facts.area}</strong> m²
                        </li>
                      </ul>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {h.facts.storeys} storeys · {h.suburb || h.agencyName} · Status:{' '}
                        {h.status}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}

            <aside aria-label="Where the homes are" style={{ marginBottom: '16px' }}>
              <figure
                style={{
                  margin: 0,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-sand)',
                  background: '#E8EAE3',
                  position: 'relative',
                }}
              >
                <figcaption
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: '#FAF8F5',
                    borderBottom: '1px solid var(--border-sand)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Where the homes are · Australia</span>
                  <span aria-label="North is up">N ↑</span>
                </figcaption>
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="/api/realestate/tile/12/3702/2510"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {filteredHomes.map((h, idx) => (
                    <Link
                      key={h.id}
                      href={`/realestate/${encodeURIComponent(h.id)}`}
                      aria-label={`Open ${h.address}`}
                      title={h.address}
                      style={{
                        position: 'absolute',
                        left: `${24 + ((idx * 23) % 65)}%`,
                        top: `${28 + ((idx * 19) % 50)}%`,
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#D96B43',
                        color: '#FFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      }}
                    >
                      {idx + 1}
                    </Link>
                  ))}
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      bottom: '4px',
                      fontSize: '0.7rem',
                      color: '#5C5B57',
                    }}
                  >
                    © OpenStreetMap contributors
                  </span>
                </div>
              </figure>
            </aside>

            <Link href="/demo/try" className="rl-btn rl-btn-secondary">
              Preview Buyer 3D Experience →
            </Link>
          </div>
        </div>

        {/* Realtor Partner Access Request Section matching chunks_1958 */}
        <section
          aria-labelledby="re-request-title"
          className="rl-card"
          style={{ maxWidth: '640px', marginBottom: '28px' }}
        >
          <h2 id="re-request-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
            Request agency partner access
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            For realtors. Use your work email at your agency’s website address.
          </p>

          {reqStage === 'details' && (
            <form onSubmit={handleAskForAccess} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                Your name
                <input
                  className="rl-input"
                  value={reqName}
                  onChange={e => setReqName(e.target.value)}
                  maxLength={80}
                  required
                />
              </label>
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                Agency website
                <input
                  className="rl-input"
                  placeholder="raywhite.com.au"
                  value={reqWebsite}
                  onChange={e => setReqWebsite(e.target.value)}
                  maxLength={300}
                  required
                />
              </label>
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                Work email
                <input
                  type="email"
                  className="rl-input"
                  placeholder="jane@raywhite.com.au"
                  value={reqEmail}
                  onChange={e => setReqEmail(e.target.value)}
                  maxLength={254}
                  required
                />
              </label>
              <button
                type="submit"
                className="rl-btn rl-btn-secondary"
                disabled={reqBusy || !reqName.trim() || !reqWebsite.trim() || !reqEmail.trim()}
              >
                {reqBusy ? 'Checking…' : 'Ask for access'}
              </button>
            </form>
          )}

          {reqStage === 'code' && (
            <form onSubmit={handleSendRequestCode} style={{ display: 'grid', gap: '12px' }}>
              {reqNote && (
                <p
                  role="status"
                  style={{
                    padding: '10px 12px',
                    background: '#EDF5F0',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    margin: 0,
                  }}
                >
                  {reqNote}
                </p>
              )}
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                6-digit code
                <input
                  className="rl-input"
                  inputMode="numeric"
                  maxLength={7}
                  placeholder="123456"
                  value={reqCode}
                  onChange={e => setReqCode(e.target.value)}
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="rl-btn rl-btn-primary" disabled={reqBusy}>
                  Send my request
                </button>
                <button
                  type="button"
                  className="rl-btn rl-btn-secondary"
                  onClick={() => setReqStage('details')}
                >
                  Change my details
                </button>
              </div>
            </form>
          )}

          {reqStage === 'sent' && (
            <p
              role="status"
              style={{
                padding: '12px',
                background: '#EDF5F0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                margin: 0,
              }}
            >
              {reqNote}
            </p>
          )}
        </section>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Each home is a Homistry 3D model drawn from its listing’s floor plan. Pictures are
          Homistry renders, not listing photos. Sizes are approximate.
        </p>
      </div>
    </SiteChrome>
  );
}

