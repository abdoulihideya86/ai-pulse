import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-pulse.app'
  const now = new Date().toISOString()

  const pages = [
    { url: baseUrl, lastModified: now, changeFrequency: 'hourly' as const, priority: 1.0 },
    { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/analytics`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/settings`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  return pages
}
