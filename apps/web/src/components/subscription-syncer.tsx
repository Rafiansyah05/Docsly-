'use client';

import { useEffect, useRef } from 'react';

export function SubscriptionSyncer() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    // Trigger sinkronisasi secara diam-diam di background
    fetch('/api/user/sync-subscription', { method: 'POST' })
      .catch(err => console.error('Failed to sync subscription:', err));
  }, []);

  return null;
}
