import type { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#09090b',
        color: '#fafafa',
        margin: 0,
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 700, margin: '0 0 1rem' }}>
        {statusCode || '?'}
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#a1a1aa', margin: 0 }}>
        {statusCode === 404
          ? 'Halaman tidak ditemukan'
          : statusCode === 500
          ? 'Terjadi kesalahan server'
          : 'Terjadi kesalahan'}
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.5rem 1.5rem',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Kembali ke Beranda
      </a>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode : 404
  return { statusCode }
}

export default Error
