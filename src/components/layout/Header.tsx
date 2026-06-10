'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { logout } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Productos', active: pathname === '/dashboard' },
    { href: '/product/new', label: 'Nuevo producto', active: pathname === '/product/new' },
  ]

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[54px] items-center justify-between border-b border-border bg-[#0A0A0BCC] px-4 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo-mark.svg" alt="" className="h-7 w-7 rounded-lg" />
          <span className="text-base font-bold tracking-[-0.02em]">Prodcast</span>
        </Link>
        <button onClick={logout} className="rounded-lg px-2 py-1 text-sm text-[#8A8A96] transition hover:bg-surface-raised hover:text-[#EDEDF0]">
          Salir
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-44 flex-col border-r border-border bg-[#0C0C0E] p-2.5 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-1.5 py-2">
          <img src="/logo-mark.svg" alt="" className="h-7 w-7 rounded-lg" />
          <span className="font-bold tracking-[-0.02em]">PRODCAST</span>
        </Link>
        <p className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B6B76]">Taller</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition ${
                item.active ? 'bg-indigo-500/10 text-[#EDEDF0]' : 'text-[#A1A1AC] hover:bg-surface-raised hover:text-[#EDEDF0]'
              }`}
            >
              <span className={item.active ? 'text-brand' : 'text-[#8A8A96]'}>{item.href === '/dashboard' ? '◇' : '+'}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border px-2 py-3">
          <p className="truncate text-xs font-semibold">Red Impulso</p>
          <button onClick={logout} className="mt-1 text-xs text-[#8A8A96] transition hover:text-[#EDEDF0]">Cerrar sesión</button>
        </div>
      </aside>
    </>
  )
}
