import { apiGet, apiPost, ApiClientError, TOKEN_KEY } from '@/lib/api'

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
