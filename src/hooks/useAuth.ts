'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/auth'

export function useAuth() {
  const store = useAuthStore()
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      store.hydrate()
    }
  }, [store])

  return store
}
