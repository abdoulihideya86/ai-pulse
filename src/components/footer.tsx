'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Brain,
  Twitter,
  Github,
  Linkedin,
  Rss,
  Mail,
  ArrowLeft,
  ArrowRight,
  Heart,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

const footerLinks = {
  news: {
    titleAr: 'الأخبار',
    titleEn: 'News',
    links: [
      { labelAr: 'أحدث الأخبار', labelEn: 'Latest News', href: '#' },
      { labelAr: 'الذكاء الاصطناعي التوليدي', labelEn: 'Generative AI', href: '#' },
      { labelAr: 'تعلم الآلة', labelEn: 'Machine Learning', href: '#' },
      { labelAr: 'الروبوتات', labelEn: 'Robotics', href: '#' },
      { labelAr: 'أخبار الشركات', labelEn: 'Company News', href: '#' },
    ],
  },
  tools: {
    titleAr: 'الأدوات',
    titleEn: 'Tools',
    links: [
      { labelAr: 'مقارنة الأدوات', labelEn: 'Compare Tools', href: '#' },
      { labelAr: 'أدوات مجانية', labelEn: 'Free Tools', href: '#' },
      { labelAr: 'واجهات API', labelEn: 'APIs', href: '#' },
      { labelAr: 'أدوات المطورين', labelEn: 'Dev Tools', href: '#' },
      { labelAr: 'الأكثر استخداماً', labelEn: 'Most Used', href: '#' },
    ],
  },
  company: {
    titleAr: 'الشركة',
    titleEn: 'Company',
    links: [
      { labelAr: 'من نحن', labelEn: 'About Us', href: '#' },
      { labelAr: 'اتصل بنا', labelEn: 'Contact', href: '#' },
      { labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy', href: '#' },
      { labelAr: 'الشروط والأحكام', labelEn: 'Terms of Service', href: '#' },
      { labelAr: 'انضم إلينا', labelEn: 'Join Us', href: '#' },
    ],
  },
}

const socialLinks = [
  { icon: <Twitter className="size-4" />, label: 'Twitter', href: '#' },
  { icon: <Github className="size-4" />, label: 'GitHub', href: '#' },
  { icon: <Linkedin className="size-4" />, label: 'LinkedIn', href: '#' },
  { icon: <Rss className="size-4" />, label: 'RSS Feed', href: '#' },
]

export function Footer() {
  const language = useAppStore((s) => s.language)
  const isRTL = language === 'ar'
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success(
      isRTL
        ? 'شكراً لاشتراكك! ستصلك أحدث أخبار الذكاء الاصطناعي.'
        : 'Thanks for subscribing! You\'ll receive the latest AI news.'
    )
    setEmail('')
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <footer className="mt-auto" role="contentinfo">
      {/* Gradient border top — AI Pulse brand */}
      <div className="ai-divider-gradient" />

      <div className="bg-card/50 backdrop-blur-sm border-t border-ai-purple/10">
        <div className="container mx-auto px-4 py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand + Newsletter */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-9 rounded-lg ai-gradient">
                  <Brain className="size-5 text-white" />
                </div>
                <span className="text-xl font-bold ai-text-gradient">
                  AI Pulse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {isRTL
                  ? 'منصتك المتكاملة لمتابعة أحدث أخبار وتحليلات الذكاء الاصطناعي. نبقيك على اطلاع بكل جديد في عالم الذكاء الاصطناعي.'
                  : 'Your comprehensive platform for the latest AI news and analysis. Stay updated with everything new in the AI world.'}
              </p>

              {/* Newsletter */}
              <form onSubmit={handleNewsletter} className="space-y-2">
                <label
                  htmlFor="newsletter-email"
                  className="text-sm font-medium"
                >
                  {isRTL ? 'النشرة البريدية' : 'Newsletter'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="newsletter-email"
                      type="email"
                      placeholder={
                        isRTL ? 'بريدك الإلكتروني' : 'Your email'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ps-9 h-9"
                      dir="ltr"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="btn-ai-gradient shrink-0"
                  >
                    {isRTL ? 'اشتراك' : 'Subscribe'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Links columns */}
            {Object.values(footerLinks).map((section) => (
              <div key={section.titleAr} className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">
                  {isRTL ? section.titleAr : section.titleEn}
                </h3>
                <ul className="space-y-2" role="list">
                  {section.links.map((link) => (
                    <li key={link.labelAr}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      >
                        <ArrowIcon className="size-3 opacity-0 -ms-4 group-hover:opacity-100 group-hover:ms-0 transition-all" />
                        {isRTL ? link.labelAr : link.labelEn}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-8 bg-ai-purple/10" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AI Pulse.{' '}
              {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="flex items-center justify-center size-8 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {/* Made with love */}
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              {isRTL ? 'صُنع بـ' : 'Made with'}{' '}
              <Heart className="size-3 text-ai-pink fill-ai-pink" />{' '}
              {isRTL ? 'لعشاق الذكاء الاصطناعي' : 'for AI enthusiasts'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
