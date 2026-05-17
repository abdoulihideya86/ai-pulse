'use client'

import { useState } from 'react'
import { useAppStore, useLanguage, useIsRTL } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  User,
  Globe,
  Palette,
  Bell,
  Tags,
  BookOpen,
  Shield,
  LogOut,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Check,
  ChevronRight,
  Type,
  Languages,
  BellRing,
  BookMarked,
  Mail,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

// ---- Section Wrapper ----
function SettingsSection({
  icon,
  titleAr,
  titleEn,
  children,
  delay = 0,
}: {
  icon: React.ReactNode
  titleAr: string
  titleEn: string
  children: React.ReactNode
  delay?: number
}) {
  const isRTL = useIsRTL()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="ai-card">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-ai-purple/20 to-ai-cyan/20 text-primary shrink-0">
              {icon}
            </div>
            <h2 className="text-lg font-bold">
              {isRTL ? titleAr : titleEn}
            </h2>
          </div>
          <Separator />
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---- Setting Row ----
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ======== Main SettingsPage Component ========
export function SettingsPage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const {
    setLanguage,
    setTheme,
    navigate,
    // Font size from store
    fontSize,
    setFontSize,
    // Reading mode from store
    readingMode,
    setReadingMode,
    // Push notifications from store
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    // Bookmarks
    bookmarkedIds,
    // Newsletter
    newsletterSubscribed,
  } = useAppStore()
  const theme = useAppStore((s) => s.theme)

  // Local state
  const [autoTTS, setAutoTTS] = useState(false)
  const [breakingNews, setBreakingNews] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(true)
  const [topicUpdates, setTopicUpdates] = useState(false)
  const [weeklyRecs, setWeeklyRecs] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Push notification permission handler
  const handlePushNotificationToggle = async () => {
    if (pushNotificationsEnabled) {
      setPushNotificationsEnabled(false)
      return
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPushNotificationsEnabled(true)
      }
    }
  }

  // Content preferences categories
  const contentCategories = [
    { id: 'llm', labelAr: 'نماذج اللغة', labelEn: 'LLMs' },
    { id: 'computer-vision', labelAr: 'الرؤية الحاسوبية', labelEn: 'Computer Vision' },
    { id: 'nlp', labelAr: 'معالجة اللغات الطبيعية', labelEn: 'Natural Language Processing' },
    { id: 'robotics', labelAr: 'الروبوتات', labelEn: 'Robotics' },
    { id: 'healthcare', labelAr: 'الذكاء الاصطناعي في الصحة', labelEn: 'Healthcare AI' },
    { id: 'ethics', labelAr: 'أخلاقيات الذكاء الاصطناعي', labelEn: 'AI Ethics' },
    { id: 'business', labelAr: 'أعمال الذكاء الاصطناعي', labelEn: 'AI Business' },
    { id: 'research', labelAr: 'البحث العلمي', labelEn: 'Research' },
    { id: 'education', labelAr: 'التعليم بالذكاء الاصطناعي', labelEn: 'AI Education' },
    { id: 'creative', labelAr: 'الذكاء الاصطناعي الإبداعي', labelEn: 'Creative AI' },
  ]
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'llm',
    'nlp',
    'research',
  ])

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // Theme options config
  const themeOptions = [
    {
      value: 'light' as const,
      labelAr: 'فاتح',
      labelEn: 'Light',
      icon: <Sun className="size-5" />,
      previewBg: 'bg-white',
      previewText: 'text-gray-900',
      previewBorder: 'border-gray-200',
    },
    {
      value: 'dark' as const,
      labelAr: 'داكن',
      labelEn: 'Dark',
      icon: <Moon className="size-5" />,
      previewBg: 'bg-[#0a0a1a]',
      previewText: 'text-gray-100',
      previewBorder: 'border-purple-500/30',
    },
    {
      value: 'system' as const,
      labelAr: 'النظام',
      labelEn: 'System',
      icon: <Monitor className="size-5" />,
      previewBg: 'bg-gradient-to-r from-white to-[#0a0a1a]',
      previewText: 'text-gray-500',
      previewBorder: 'border-gray-400/30',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-3xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-ai-purple to-ai-cyan text-white">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isRTL ? 'الإعدادات' : 'Settings'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? 'إدارة تفضيلاتك وإعدادات حسابك'
                : 'Manage your preferences and account settings'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 1. Profile */}
      <SettingsSection
        icon={<User className="size-4" />}
        titleAr="الملف الشخصي"
        titleEn="Profile"
        delay={0.05}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-gradient-to-br from-ai-purple to-ai-cyan text-white text-xl font-bold">
              م
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-bold text-lg">
              {isRTL ? 'مستخدم نبض AI' : 'AI Pulse User'}
            </p>
            <p className="text-sm text-muted-foreground">user@aipulse.com</p>
            <Badge variant="secondary" className="text-xs">
              {isRTL ? 'مستوى مجاني' : 'Free Tier'}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-muted/30">
            <BookMarked className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'المحفوظات' : 'Bookmarks'}
              </p>
              <p className="text-sm font-bold tabular-nums">
                {bookmarkedIds.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-muted/30">
            <Mail className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'النشرة البريدية' : 'Newsletter'}
              </p>
              <p className="text-sm font-bold">
                {newsletterSubscribed
                  ? isRTL ? 'مشترك' : 'Subscribed'
                  : isRTL ? 'غير مشترك' : 'Not Subscribed'}
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 2. Language & Region */}
      <SettingsSection
        icon={<Globe className="size-4" />}
        titleAr="اللغة والمنطقة"
        titleEn="Language & Region"
        delay={0.1}
      >
        <SettingRow
          label={isRTL ? 'اللغة' : 'Language'}
          description={isRTL ? 'اختر لغة الواجهة' : 'Choose interface language'}
        >
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as 'ar' | 'en')}
          >
            <SelectTrigger className="w-[140px]">
              <Languages className="size-3.5 me-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">
                <span className="flex items-center gap-1.5">🇸🇦 العربية</span>
              </SelectItem>
              <SelectItem value="en">
                <span className="flex items-center gap-1.5">🇬🇧 English</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          label={isRTL ? 'اتجاه النص' : 'Text Direction'}
          description={
            isRTL
              ? language === 'ar'
                ? 'من اليمين لليسار (تلقائي)'
                : 'From Right to Left (auto)'
              : language === 'ar'
                ? 'From Right to Left (auto)'
                : 'Left to Right (auto)'
          }
        >
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-0.5 border-primary/25 text-primary"
          >
            {language === 'ar' ? 'RTL' : 'LTR'}
          </Badge>
        </SettingRow>
      </SettingsSection>

      {/* 3. Theme */}
      <SettingsSection
        icon={<Palette className="size-4" />}
        titleAr="المظهر"
        titleEn="Theme"
        delay={0.15}
      >
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const isActive = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`
                  relative rounded-xl p-3 border-2 transition-all duration-200 text-center space-y-2
                  ${isActive
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute -top-1.5 -end-1.5 flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </div>
                )}
                {/* Preview card */}
                <div
                  className={`mx-auto w-full h-12 rounded-lg border ${opt.previewBg} ${opt.previewBorder} flex items-center justify-center mb-1`}
                >
                  <span className={`text-xs font-medium ${opt.previewText}`}>
                    {isRTL ? (opt.labelAr) : (opt.labelEn)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  {opt.icon}
                  <span className="text-xs font-medium">
                    {isRTL ? opt.labelAr : opt.labelEn}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </SettingsSection>

      {/* 4. Notification Preferences */}
      <SettingsSection
        icon={<Bell className="size-4" />}
        titleAr="إشعارات"
        titleEn="Notifications"
        delay={0.2}
      >
        <SettingRow
          label={isRTL ? 'إشعارات الدفع' : 'Push Notifications'}
          description={
            isRTL
              ? 'تلقي إشعارات فورية على جهازك'
              : 'Receive instant push notifications on your device'
          }
        >
          <Button
            size="sm"
            variant={pushNotificationsEnabled ? 'default' : 'outline'}
            className="gap-1.5"
            onClick={handlePushNotificationToggle}
          >
            <BellRing className="size-3.5" />
            {pushNotificationsEnabled
              ? isRTL ? 'مفعّل' : 'Enabled'
              : isRTL ? 'تفعيل' : 'Enable'}
          </Button>
        </SettingRow>

        <SettingRow
          label={isRTL ? 'إشعارات الأخبار العاجلة' : 'Breaking News Alerts'}
          description={
            isRTL
              ? 'تلقي إشعارات فورية للأخبار العاجلة'
              : 'Receive instant notifications for breaking news'
          }
        >
          <Switch checked={breakingNews} onCheckedChange={setBreakingNews} />
        </SettingRow>

        <SettingRow
          label={isRTL ? 'ملخص يومي' : 'Daily Digest'}
          description={
            isRTL
              ? 'ملخص يومي لأهم الأخبار'
              : 'Daily summary of top news'
          }
        >
          <Switch checked={dailyDigest} onCheckedChange={setDailyDigest} />
        </SettingRow>

        <SettingRow
          label={isRTL ? 'تحديثات المواضيع المتابعة' : 'Topic Updates'}
          description={
            isRTL
              ? 'إشعارات عند تحديث المواضيع المتابعة'
              : 'Notifications when followed topics are updated'
          }
        >
          <Switch checked={topicUpdates} onCheckedChange={setTopicUpdates} />
        </SettingRow>

        <SettingRow
          label={isRTL ? 'توصيات أسبوعية' : 'Weekly Recommendations'}
          description={
            isRTL
              ? 'توصيات مخصصة كل أسبوع'
              : 'Personalized recommendations every week'
          }
        >
          <Switch checked={weeklyRecs} onCheckedChange={setWeeklyRecs} />
        </SettingRow>
      </SettingsSection>

      {/* 5. Content Preferences */}
      <SettingsSection
        icon={<Tags className="size-4" />}
        titleAr="تفضيلات المحتوى"
        titleEn="Content Preferences"
        delay={0.25}
      >
        <p className="text-xs text-muted-foreground mb-3">
          {isRTL
            ? 'اختر المواضيع التي تهمك لتخصيص محتواك'
            : 'Select topics you are interested in to personalize your content'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {contentCategories.map((cat) => (
            <label
              key={cat.id}
              className={`
                flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all
                ${selectedCategories.includes(cat.id)
                  ? 'border-primary/50 bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/20'
                }
              `}
            >
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span className="text-xs font-medium">
                {isRTL ? cat.labelAr : cat.labelEn}
              </span>
            </label>
          ))}
        </div>
      </SettingsSection>

      {/* 6. Reading Preferences */}
      <SettingsSection
        icon={<BookOpen className="size-4" />}
        titleAr="تفضيلات القراءة"
        titleEn="Reading Preferences"
        delay={0.3}
      >
        <div className="space-y-3">
          <SettingRow
            label={isRTL ? 'وضع القراءة' : 'Reading Mode'}
            description={
              isRTL
                ? 'عرض مبسط وخالٍ من المشتتات للمقالات'
                : 'Simplified, distraction-free view for articles'
            }
          >
            <div className="flex items-center gap-2">
              <Eye className={`size-4 ${readingMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch checked={readingMode} onCheckedChange={setReadingMode} />
            </div>
          </SettingRow>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Type className="size-3.5" />
                {isRTL ? 'حجم الخط' : 'Font Size'}
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {fontSize}px
              </span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(v) => setFontSize(v[0])}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{isRTL ? 'صغير' : 'Small'}</span>
              <span>{isRTL ? 'كبير' : 'Large'}</span>
            </div>
          </div>

          <Separator />

          <SettingRow
            label={isRTL ? 'تشغيل تلقائي للصوت' : 'Auto-play TTS'}
            description={
              isRTL
                ? 'تشغيل النطق التلقائي عند فتح المقالات'
                : 'Automatically play text-to-speech when opening articles'
            }
          >
            <div className="flex items-center gap-2">
              {autoTTS ? (
                <Volume2 className="size-4 text-primary" />
              ) : (
                <VolumeX className="size-4 text-muted-foreground" />
              )}
              <Switch checked={autoTTS} onCheckedChange={setAutoTTS} />
            </div>
          </SettingRow>
        </div>
      </SettingsSection>

      {/* 7. Account */}
      <SettingsSection
        icon={<Shield className="size-4" />}
        titleAr="الحساب"
        titleEn="Account"
        delay={0.35}
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive hover:bg-destructive/5"
            onClick={() => {
              navigate('home')
            }}
          >
            <LogOut className="size-4" />
            {isRTL ? 'تسجيل الخروج' : 'Log Out'}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            {isRTL ? 'حذف الحساب' : 'Delete Account'}
          </Button>
        </div>
      </SettingsSection>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              {isRTL ? 'حذف الحساب' : 'Delete Account'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع بياناتك وإعداداتك نهائياً.'
                : 'Are you sure you want to delete your account? This action cannot be undone. All your data and settings will be permanently deleted.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none gap-1.5"
            >
              <Trash2 className="size-3.5" />
              {isRTL ? 'حذف نهائي' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
