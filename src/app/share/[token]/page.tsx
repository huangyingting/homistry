'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StudioWorkspace, StudioPiece } from '@/components/studio/StudioWorkspace';
import { SiteChrome } from '@/components/SiteChrome';

export default function SharedHomePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || '';

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [homeData, setHomeData] = useState<{
    id: string;
    title: string;
    storeys: number;
    unit: 'm' | 'ft';
    plan: Record<string, unknown>;
    pieces: StudioPiece[];
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/share/${encodeURIComponent(token)}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(
            data.error ||
              'This share link is unavailable. The owner may have stopped sharing.'
          );
        } else {
          setHomeData(data.home);
        }
      })
      .catch(() => {
        setErrorMessage(
          'This share link is unavailable. The owner may have stopped sharing.'
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <SiteChrome>
        <div className="rl-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p>Loading shared 3D home...</p>
        </div>
      </SiteChrome>
    );
  }

  if (errorMessage || !homeData) {
    return (
      <SiteChrome>
        <div
          className="rl-container"
          style={{ padding: '96px 24px', textAlign: 'center', maxWidth: '640px' }}
        >
          <span className="rl-eyebrow">SHARED WALKTHROUGH UNAVAILABLE</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '14px' }}>
            {errorMessage ||
              'This share link is unavailable. The owner may have stopped sharing.'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
            Ask the homeowner for a fresh link, or explore the Southern Farmhouse 3D demo
            instead.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link href="/demo/try" className="rl-btn rl-btn-primary">
              Walk through the 3D Demo →
            </Link>
            <Link href="/" className="rl-btn rl-btn-secondary">
              Back to Homistry
            </Link>
          </div>
        </div>
      </SiteChrome>
    );
  }

  return (
    <StudioWorkspace
      buildId={homeData.id}
      initialTitle={`${homeData.title} (SHARED)`}
      initialPlan={homeData.plan}
      initialPieces={homeData.pieces}
      initialUnit={homeData.unit}
      initialStoreys={homeData.storeys}
      viewOnly={true}
    />
  );
}
