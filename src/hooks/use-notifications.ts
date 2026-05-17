'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function useNotifications() {
  const { pushNotificationsEnabled, setPushNotificationsEnabled, addNotification, language } = useAppStore()
  const isAr = language === 'ar'

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error(isAr ? 'المتصفح لا يدعم الإشعارات' : 'Browser does not support notifications')
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setPushNotificationsEnabled(true)
      toast.success(isAr ? 'تم تفعيل الإشعارات' : 'Notifications enabled')
      return true
    } else {
      setPushNotificationsEnabled(false)
      toast.info(isAr ? 'تم رفض إذن الإشعارات' : 'Notification permission denied')
      return false
    }
  }, [isAr, setPushNotificationsEnabled])

  const sendTestNotification = useCallback(() => {
    if (!pushNotificationsEnabled) return
    new Notification(isAr ? 'نبض الذكاء الاصطناعي' : 'AI Pulse', {
      body: isAr ? 'الإشعارات تعمل بشكل صحيح!' : 'Notifications are working correctly!',
      icon: '/logo.svg',
    })
  }, [pushNotificationsEnabled, isAr])

  const notifyBreaking = useCallback((title: string) => {
    addNotification({
      title: isAr ? 'خبر عاجل' : 'Breaking News',
      message: title,
      type: 'warning',
    })
    if (pushNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(isAr ? 'خبر عاجل - نبض AI' : 'Breaking - AI Pulse', {
        body: title,
        icon: '/logo.svg',
        tag: 'breaking-news',
      })
    }
  }, [pushNotificationsEnabled, addNotification, isAr])

  return { requestPermission, sendTestNotification, notifyBreaking, pushNotificationsEnabled }
}
