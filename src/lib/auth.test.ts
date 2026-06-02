import { useAuthStore } from '@/lib/auth'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/api'

const mockApiPost = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', async (importActual) => {
  const actual = await importActual<typeof import('@/lib/api')>()
  return { ...actual, apiPost: mockApiPost }
})

const mockUser = {
  id: 'user-1',
  email: 'fabri@test.com',
  tenantId: 'tenant-1',
  role: 'operator' as const,
}

const mockLoginResponse = {
  token: 'jwt-token-abc',
  refreshToken: 'refresh-token-xyz',
  user: mockUser,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null })
    localStorage.clear()
    mockApiPost.mockReset()
  })

  describe('login()', () => {
    it('llama a POST /api/v1/auth/login con las credenciales', async () => {
      mockApiPost.mockResolvedValue(mockLoginResponse)

      await useAuthStore.getState().login({ email: 'fabri@test.com', password: '123' })

      expect(mockApiPost).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'fabri@test.com',
        password: '123',
      })
    })

    it('guarda token y refreshToken en localStorage', async () => {
      mockApiPost.mockResolvedValue(mockLoginResponse)

      await useAuthStore.getState().login({ email: 'fabri@test.com', password: '123' })

      expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token-abc')
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token-xyz')
    })

    it('actualiza user y token en el store', async () => {
      mockApiPost.mockResolvedValue(mockLoginResponse)

      await useAuthStore.getState().login({ email: 'fabri@test.com', password: '123' })

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe('jwt-token-abc')
    })

    it('setea la cookie de sesión', async () => {
      mockApiPost.mockResolvedValue(mockLoginResponse)

      await useAuthStore.getState().login({ email: 'fabri@test.com', password: '123' })

      expect(document.cookie).toContain('session=1')
    })

    it('propaga el error si la API falla', async () => {
      mockApiPost.mockRejectedValue(new Error('Credenciales incorrectas'))

      await expect(
        useAuthStore.getState().login({ email: 'fabri@test.com', password: 'wrong' })
      ).rejects.toThrow('Credenciales incorrectas')
    })

    it('el store no queda en estado inválido si el login falla', async () => {
      mockApiPost.mockRejectedValue(new Error('Error'))

      await useAuthStore.getState().login({ email: 'x', password: 'x' }).catch(() => {})

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })
  })

  describe('logout()', () => {
    beforeEach(() => {
      useAuthStore.setState({ user: mockUser, token: 'jwt-token-abc' })
      localStorage.setItem(TOKEN_KEY, 'jwt-token-abc')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token-xyz')
    })

    it('limpia user y token del store', () => {
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })

    it('elimina tokens de localStorage', () => {
      useAuthStore.getState().logout()

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
    })
  })

  describe('hydrate()', () => {
    it('carga el token desde localStorage al iniciar', () => {
      localStorage.setItem(TOKEN_KEY, 'stored-token')

      useAuthStore.getState().hydrate()

      expect(useAuthStore.getState().token).toBe('stored-token')
    })

    it('no modifica el store si no hay token guardado', () => {
      useAuthStore.getState().hydrate()

      expect(useAuthStore.getState().token).toBeNull()
    })
  })
})
