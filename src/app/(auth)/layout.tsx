'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SESSION_EXPIRED_EVENT, TOKEN_REFRESHED_EVENT } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { token, logout, hydrate } = useAuth()
  const router = useRouter()
  // Track whether the client-side hydration from localStorage has completed.
  // useAuth's hydrate() runs in a useEffect registered BEFORE this one, so by the
  // time isHydrated becomes true, the Zustand token is already resolved.
  // Without this flag, the redirect fires on the first render where token===null,
  // racing against hydration and always winning — even when localStorage has a valid token.
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      logout()
      router.replace('/login')
    }
    const handleTokenRefreshed = () => hydrate()

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    window.addEventListener(TOKEN_REFRESHED_EVENT, handleTokenRefreshed)

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
      window.removeEventListener(TOKEN_REFRESHED_EVENT, handleTokenRefreshed)
    }
  }, [hydrate, logout, router])

  useEffect(() => {
    if (isHydrated && token === null) {
      router.replace('/login')
    }
  }, [isHydrated, token, router])

  if (!isHydrated || token === null) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="min-h-screen pb-20 md:pl-44 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
