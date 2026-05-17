import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a1a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "AI Pulse - نبض الذكاء الاصطناعي",
    template: "%s | AI Pulse",
  },
  description:
    "منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي. تابع أحدث التطورات في عالم AI مع تقارير معمقة وأدوات متقدمة.",
  keywords: [
    "AI", "Artificial Intelligence", "الذكاء الاصطناعي",
    "أخبار AI", "تحليلات", "أدوات AI",
    "AI Pulse", "نبض الذكاء الاصطناعي",
    "Machine Learning", "تعلم الآلة",
    "Deep Learning", "التعلم العميق",
    "LLM", "نماذج اللغة",
    "Computer Vision", "الرؤية الحاسوبية",
  ],
  authors: [{ name: "AI Pulse Team", url: "https://ai-pulse.app" }],
  creator: "AI Pulse",
  publisher: "AI Pulse",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico", apple: "/logo.svg" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "AI Pulse - نبض الذكاء الاصطناعي",
    description: "منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي",
    url: "https://ai-pulse.app",
    siteName: "AI Pulse",
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Pulse - نبض الذكاء الاصطناعي",
    description: "منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي",
    creator: "@aipulse",
  },
  appleWebApp: {
    title: "AI Pulse",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${inter.variable} font-[family-name:var(--font-cairo)] antialiased bg-background text-foreground`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
