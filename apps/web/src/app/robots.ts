import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://docsly.space';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/w/', // Jangan index workspace/dashboard area yang private
        '/api/', // Jangan index rute API
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
