'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';

export default function RealEstateListingWalkthroughPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [address, setAddress] = useState('Property Listing 3D Walkthrough');
  const [agency, setAgency] = useState('Homistry Partner Agency');

  useEffect(() => {
    fetch('/api/realestate/homes')
      .then(r => (r.ok ? r.json() : { homes: [] }))
      .then(data => {
        const found = (data.homes || []).find((h: { id: string }) => h.id === id);
        if (found) {
          setAddress(found.address);
          setAgency(found.agencyName || 'Homistry Partner Agency');
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '12px 24px',
          background: '#181816',
          color: '#F5F2EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/realestate"
            style={{
              color: '#F5F2EB',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            ← All homes to walk through
          </Link>
          <span style={{ opacity: 0.4 }}>|</span>
          <strong>{address}</strong>
          <span style={{ fontSize: '0.82rem', color: '#A3A19A' }}>{agency}</span>
        </div>
        <ul
          aria-label="Rooms and size"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            gap: '14px',
            fontSize: '0.82rem',
            color: '#D6D1C7',
          }}
        >
          <li>4 beds</li>
          <li>2 baths</li>
          <li>2 cars</li>
          <li>245 m²</li>
        </ul>
      </header>
      <div style={{ flex: 1 }}>
        <StudioWorkspace isDemo initialTitle={address} />
      </div>
    </div>
  );
}
