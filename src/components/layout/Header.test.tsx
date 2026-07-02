import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/Header'

const mockLogout = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
    login: vi.fn(),
    hydrate: vi.fn(),
    user: { id: '1', email: 'fabri@test.com', tenantId: 'tid', role: 'operator' },
    token: 'jwt',
  }),
}))

describe('Header', () => {
  beforeEach(() => mockLogout.mockReset())

  it('muestra el nombre de la app', () => {
    render(<Header />)
    expect(screen.getByText('Impulso')).toBeInTheDocument()
  })

  it('tiene un botón de salir', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument()
  })

  it('llama a logout() al hacer click en Salir', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByRole('button', { name: /salir/i }))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
