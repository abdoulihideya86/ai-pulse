'use client'

import { ThemeProvider } from 'next-themes'
import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <DirectionSync />
      {children}
    </ThemeProvider>
  )
}
