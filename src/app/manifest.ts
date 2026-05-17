import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Pulse - نبض الذكاء الاصطناعي',
    short_name: 'AI Pulse',
    description: 'منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a1a',
    theme_color: '#8b5cf6',
    orientation: 'any',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    categories: ['news', 'technology'],
  }
}
