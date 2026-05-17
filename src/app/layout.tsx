import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "AI Pulse - نبض الذكاء الاصطناعي",
  description:
    "منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي. تابع أحدث التطورات في عالم AI مع تقارير معمقة وأدوات متقدمة.",
  keywords: [
    "AI",
    "Artificial Intelligence",
    "الذكاء الاصطناعي",
    "أخبار AI",
    "تحليلات",
    "أدوات AI",
    "AI Pulse",
    "نبض الذكاء الاصطناعي",
  ],
  authors: [{ name: "AI Pulse Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AI Pulse - نبض الذكاء الاصطناعي",
    description:
      "منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي",
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Pulse - نبض الذكاء الاصطناعي",
    description:
      "منصتك المتكاملة لأخبار وتحليلات الذكاء الاصطناعي",
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
