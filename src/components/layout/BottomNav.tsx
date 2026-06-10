'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  match: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Inicio',
    match: (p) => p === '/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/product/new',
    label: 'Nuevo',
    match: (p) => p.startsWith('/product'),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-[#0A0A0BCC] backdrop-blur-xl md:hidden">
      {navItems.map(({ href, label, icon, match }) => {
        const active = match(pathname)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
              active ? 'text-brand' : 'text-[#6B6B76] hover:text-[#A1A1AC]'
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
