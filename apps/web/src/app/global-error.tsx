'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'sans-serif', backgroundColor: '#000', color: '#fff', margin: 0 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Sistem Mengalami Kendala Fatal</h2>
        <button
          onClick={() => reset()}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Muat Ulang
        </button>
      </body>
    </html>
  );
}