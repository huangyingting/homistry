import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://homistry.ai';
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/pricing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/walkthrough`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/exterior-finishes`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/kitchens-and-cabinetry`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/furniture`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/electrical-plans`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/photoreal-renders`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/sun-study`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/features/sharing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/guides`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/demo`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/data-deletion`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: 'monthly', priority: 0.5 },
    {
      url: `${base}/floor-plan-to-3d`,
      lastModified: '2026-11-02',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/guides/choosing-cladding-for-a-new-build`,
      lastModified: '2026-11-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/guides/how-to-read-a-floor-plan`,
      lastModified: '2026-11-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
