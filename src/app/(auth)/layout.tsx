'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
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
    if (isHydrated && token === null) {
      router.replace('/login')
    }
  }, [isHydrated, token, router])

  if (!isHydrated || token === null) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
