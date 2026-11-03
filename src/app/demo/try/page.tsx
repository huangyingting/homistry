'use client';

import React, { useEffect, useState } from 'react';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';

export default function DemoTryPage() {
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/demos/southern-farmhouse/plan.json')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setPlan(data);
      })
      .catch(() => {});
  }, []);

  return (
    <StudioWorkspace
      initialTitle="SOUTHERN FARMHOUSE (DEMO)"
      initialPlan={plan}
      initialUnit="m"
      initialStoreys={2}
      isDemo={true}
    />
  );
}
