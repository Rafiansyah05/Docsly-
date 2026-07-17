/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  transpilePackages: ['lucide-react', 'framer-motion'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://snap-assets.midtrans.com https://api.midtrans.com https://app.midtrans.com https://app.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
