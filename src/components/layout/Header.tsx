'use client'

import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <span className="text-lg font-bold tracking-tight">Prodcast</span>
      <button
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-2 py-1"
      >
        Salir
      </button>
    </header>
  )
}
