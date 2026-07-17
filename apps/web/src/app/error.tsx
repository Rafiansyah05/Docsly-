'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'sans-serif', backgroundColor: '#000', color: '#fff' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Terjadi kesalahan sistem (500)</h2>
      <button
        onClick={() => reset()}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '0.25rem', cursor: 'pointer' }}
      >
        Coba Lagi
      </button>
    </div>
  );
}