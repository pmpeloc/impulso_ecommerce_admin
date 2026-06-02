import { render, screen } from '@testing-library/react'
import AuthLayout from '@/app/(auth)/layout'

const mockReplace = vi.hoisted(() => vi.fn())
const mockToken = vi.hoisted(() => ({ value: null as string | null }))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    token: mockToken.value,
    login: vi.fn(),
    logout: vi.fn(),
    hydrate: vi.fn(),
    user: null,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

describe('AuthLayout', () => {
  beforeEach(() => {
    mockReplace.mockReset()
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
})
