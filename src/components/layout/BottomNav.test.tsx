import { render, screen } from '@testing-library/react'
import { BottomNav } from '@/components/layout/BottomNav'

const mockPathname = vi.hoisted(() => ({ value: '/dashboard' }))

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname.value,
}))

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname.value = '/dashboard'
  })

  it('renderiza link al dashboard', () => {
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
  })

  it('renderiza link a nuevo producto', () => {
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /nuevo/i })).toBeInTheDocument()
  })

  it('link de inicio tiene href /dashboard', () => {
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/dashboard')
  })

  it('link de nuevo tiene href /product/new', () => {
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /nuevo/i })).toHaveAttribute('href', '/product/new')
  })

  it('link de inicio tiene aria-current="page" cuando pathname es /dashboard', () => {
    mockPathname.value = '/dashboard'
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('aria-current', 'page')
  })

  it('link de inicio NO tiene aria-current cuando no está en /dashboard', () => {
    mockPathname.value = '/product/new'
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /inicio/i })).not.toHaveAttribute('aria-current', 'page')
  })

  it('link de nuevo tiene aria-current="page" cuando pathname empieza con /product', () => {
    mockPathname.value = '/product/new'
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /nuevo/i })).toHaveAttribute('aria-current', 'page')
  })
})
