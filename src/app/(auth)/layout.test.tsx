import { render, screen } from '@testing-library/react'
import AuthLayout from '@/app/(auth)/layout'
import { SESSION_EXPIRED_EVENT } from '@/lib/api'

const mockReplace = vi.hoisted(() => vi.fn())
const mockToken = vi.hoisted(() => ({ value: null as string | null }))
const mockLogout = vi.hoisted(() => vi.fn())
const mockHydrate = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    token: mockToken.value,
    login: vi.fn(),
    logout: mockLogout,
    hydrate: mockHydrate,
    user: null,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/dashboard',
}))

describe('AuthLayout', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockLogout.mockReset()
    mockHydrate.mockReset()
    mockToken.value = null
  })

  it('renderiza children cuando hay token', () => {
    mockToken.value = 'jwt-valido'
    render(<AuthLayout><div>Contenido protegido</div></AuthLayout>)
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('no renderiza children mientras no hay token (estado inicial)', () => {
    mockToken.value = null
    render(<AuthLayout><div>Contenido protegido</div></AuthLayout>)
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('cierra sesión y redirige a login cuando expira la sesión', () => {
    mockToken.value = 'jwt-valido'
    render(<AuthLayout><div>Contenido protegido</div></AuthLayout>)

    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })
})
