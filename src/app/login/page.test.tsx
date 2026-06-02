import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import { ApiClientError } from '@/lib/api'

const mockLogin = vi.hoisted(() => vi.fn())
const mockPush = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    hydrate: vi.fn(),
    user: null,
    token: null,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockPush.mockReset()
  })

  it('renderiza campos de email y password', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('renderiza el botón de submit', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra error de validación si el email es inválido', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'no-es-un-email')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument()
  })

  it('muestra error de validación si el password está vacío', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/contraseña es requerida/i)).toBeInTheDocument()
  })

  it('muestra error de API si las credenciales son incorrectas', async () => {
    mockLogin.mockRejectedValue(
      new ApiClientError({ code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas', statusCode: 401 })
    )
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument()
  })

  it('redirige a /dashboard en login exitoso', async () => {
    mockLogin.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), '123456')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('no llama a login si hay errores de validación', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(mockLogin).not.toHaveBeenCalled()
  })
})
