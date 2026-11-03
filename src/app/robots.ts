import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/account',
        '/build',
        '/studio',
        '/compare',
        '/reference',
        '/realestate',
      ],
    },
    sitemap: 'https://homistry.ai/sitemap.xml',
  };
}
