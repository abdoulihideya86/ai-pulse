'use client'

import { ThemeProvider } from 'next-themes'
import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'

function DirectionSync() {
  const language = useAppStore((state) => state.language)

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr'
    const lang = language
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
  }, [language])

  return null
}

function ReadingModeSync() {
  const readingMode = useAppStore((state) => state.readingMode)

  useEffect(() => {
    if (readingMode) {
      document.body.classList.add('reading-mode')
    } else {
      document.body.classList.remove('reading-mode')
    }
  }, [readingMode])

  return null
}

function PWARegistration() {
  usePWA()
  return null
}

function JsonLdScript() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Pulse',
    alternateName: 'نبض الذكاء الاصطناعي',
    url: 'https://ai-pulse.app',
    description: 'منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي',
    inLanguage: ['ar', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ai-pulse.app/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <DirectionSync />
      <ReadingModeSync />
      <PWARegistration />
      <JsonLdScript />
      {children}
    </ThemeProvider>
  )
}
