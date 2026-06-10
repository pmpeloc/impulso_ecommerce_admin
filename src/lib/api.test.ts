import {
  apiGet,
  apiPost,
  ApiClientError,
  REFRESH_TOKEN_KEY,
  SESSION_EXPIRED_EVENT,
  TOKEN_KEY,
} from '@/lib/api'

describe('api client', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('Authorization header', () => {
    it('añade Bearer token cuando hay sesión', async () => {
      localStorage.setItem(TOKEN_KEY, 'mi-token-jwt')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await apiGet('/api/v1/products')

      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers['Authorization']).toBe('Bearer mi-token-jwt')
    })

    it('no añade Authorization si no hay token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await apiGet('/api/v1/products')

      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers['Authorization']).toBeUndefined()
    })
  })

  describe('base URL', () => {
    it('prefija NEXT_PUBLIC_API_URL al path', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await apiGet('/api/v1/products')

      const [url] = mockFetch.mock.calls[0]
      expect(url).toBe('http://localhost:3001/api/v1/products')
    })
  })

  describe('errores HTTP', () => {
    it('lanza ApiClientError en respuesta 4xx', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          error: { code: 'PRODUCT_NOT_FOUND', message: 'No encontrado', statusCode: 404 },
        }),
      })

      await expect(apiGet('/api/v1/products/999')).rejects.toBeInstanceOf(ApiClientError)
    })

    it('expone code y statusCode del error de la API', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: { code: 'UNAUTHORIZED', message: 'No autorizado', statusCode: 401 },
        }),
      })

      const err = await apiGet('/api/v1/products').catch((e) => e)
      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.code).toBe('UNAUTHORIZED')
      expect(err.statusCode).toBe(401)
    })

    it('lanza ApiClientError genérico si la respuesta de error no es JSON válido', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => { throw new Error('not json') },
      })

      const err = await apiGet('/api/v1/products').catch((e) => e)
      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.statusCode).toBe(500)
    })

    it('lanza error en fallo de red', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

      await expect(apiGet('/api/v1/products')).rejects.toThrow()
    })
  })

  describe('refresh de sesión', () => {
    it('refresca el token y reintenta una vez ante un 401', async () => {
      localStorage.setItem(TOKEN_KEY, 'expired-token')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh')

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            error: { code: 'UNAUTHORIZED', message: 'Token vencido', statusCode: 401 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ token: 'new-token', refreshToken: 'new-refresh' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ products: [] }),
        })

      await expect(apiGet('/api/v1/products')).resolves.toEqual({ products: [] })

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch.mock.calls[1][0]).toBe('http://localhost:3001/api/v1/auth/refresh')
      expect(mockFetch.mock.calls[2][1].headers.Authorization).toBe('Bearer new-token')
      expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token')
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh')
    })

    it('conserva el refresh token anterior si la API todavía no devuelve uno rotado', async () => {
      localStorage.setItem(TOKEN_KEY, 'expired-token')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh')

      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: {} }) })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ token: 'new-token' }),
        })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })

      await apiGet('/api/v1/products')

      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('old-refresh')
    })

    it('usa un solo refresh para requests concurrentes con 401', async () => {
      localStorage.setItem(TOKEN_KEY, 'expired-token')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh')
      let refreshCalls = 0

      mockFetch.mockImplementation(async (url: string, options: RequestInit) => {
        if (url.endsWith('/api/v1/auth/refresh')) {
          refreshCalls += 1
          await Promise.resolve()
          return {
            ok: true,
            status: 200,
            json: async () => ({ token: 'new-token', refreshToken: 'new-refresh' }),
          }
        }

        const authorization = (options.headers as Record<string, string>).Authorization
        if (authorization === 'Bearer expired-token') {
          return {
            ok: false,
            status: 401,
            json: async () => ({
              error: { code: 'UNAUTHORIZED', message: 'Token vencido', statusCode: 401 },
            }),
          }
        }

        return { ok: true, status: 200, json: async () => ({ ok: true }) }
      })

      await Promise.all([
        apiGet('/api/v1/products'),
        apiGet('/api/v1/products/1/pipeline'),
      ])

      expect(refreshCalls).toBe(1)
    })

    it('reutiliza un token ya renovado si un 401 anterior llega tarde', async () => {
      localStorage.setItem(TOKEN_KEY, 'expired-token')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh')
      let resolveLateUnauthorized: ((value: unknown) => void) | undefined
      const lateUnauthorized = new Promise((resolve) => {
        resolveLateUnauthorized = resolve
      })
      let oldTokenCalls = 0
      let refreshCalls = 0

      mockFetch.mockImplementation(async (url: string, options: RequestInit) => {
        if (url.endsWith('/api/v1/auth/refresh')) {
          refreshCalls += 1
          return {
            ok: true,
            status: 200,
            json: async () => ({ token: 'new-token', refreshToken: 'new-refresh' }),
          }
        }

        const authorization = (options.headers as Record<string, string>).Authorization
        if (authorization === 'Bearer expired-token') {
          oldTokenCalls += 1
          if (oldTokenCalls === 2) return lateUnauthorized
          return {
            ok: false,
            status: 401,
            json: async () => ({
              error: { code: 'UNAUTHORIZED', message: 'Token vencido', statusCode: 401 },
            }),
          }
        }

        return { ok: true, status: 200, json: async () => ({ ok: true }) }
      })

      const firstRequest = apiGet('/api/v1/products')
      const lateRequest = apiGet('/api/v1/products/1/pipeline')

      await firstRequest
      resolveLateUnauthorized?.({
        ok: false,
        status: 401,
        json: async () => ({
          error: { code: 'UNAUTHORIZED', message: 'Token vencido', statusCode: 401 },
        }),
      })
      await lateRequest

      expect(refreshCalls).toBe(1)
    })

    it('limpia la sesión y emite evento cuando el refresh token es inválido', async () => {
      localStorage.setItem(TOKEN_KEY, 'expired-token')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'invalid-refresh')
      const onExpired = vi.fn()
      window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            error: { code: 'UNAUTHORIZED', message: 'Token vencido', statusCode: 401 },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            error: { code: 'UNAUTHORIZED', message: 'Refresh inválido', statusCode: 401 },
          }),
        })

      await expect(apiGet('/api/v1/products')).rejects.toBeInstanceOf(ApiClientError)

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
      expect(onExpired).toHaveBeenCalledTimes(1)
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
    })

    it('no intenta refresh para un 401 del login', async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'stored-refresh')
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas', statusCode: 401 },
        }),
      })

      await expect(
        apiPost('/api/v1/auth/login', { email: 'a@b.com', password: 'bad' }),
      ).rejects.toBeInstanceOf(ApiClientError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('apiPost con JSON', () => {
    it('envía method POST con body JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await apiPost('/api/v1/auth/login', { email: 'a@b.com', password: '123' })

      const [, options] = mockFetch.mock.calls[0]
      expect(options.method).toBe('POST')
      expect(options.body).toBe(JSON.stringify({ email: 'a@b.com', password: '123' }))
      expect(options.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('apiPost con FormData', () => {
    it('envía FormData sin forzar Content-Type', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      const form = new FormData()
      form.append('name', 'Almohada')
      await apiPost('/api/v1/products', form)

      const [, options] = mockFetch.mock.calls[0]
      expect(options.body).toBe(form)
      expect(options.headers['Content-Type']).toBeUndefined()
    })
  })
})
