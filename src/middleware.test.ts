import { middleware } from '@/middleware'
import type { NextRequest } from 'next/server'

const mockRedirect = vi.hoisted(() => vi.fn())
const mockNext = vi.hoisted(() => vi.fn())

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
  },
}))

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  return {
    url: `http://localhost:3000${path}`,
    nextUrl: new URL(`http://localhost:3000${path}`),
    cookies: {
      get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
    },
  } as unknown as NextRequest
}

describe('middleware', () => {
  beforeEach(() => {
    mockRedirect.mockReset()
    mockNext.mockReset()
  })

  it('redirige a /login si no hay cookie de sesión', () => {
    middleware(makeRequest('/dashboard'))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl: URL = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('llama a next() si hay cookie session=1', () => {
    middleware(makeRequest('/dashboard', { session: '1' }))

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirige /product/nuevo sin sesión', () => {
    middleware(makeRequest('/product/nuevo'))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
  })

  it('redirige /product/[id] anidado sin sesión', () => {
    middleware(makeRequest('/product/abc-123'))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
  })

  it('preserva el path base de la URL al redirigir', () => {
    middleware(makeRequest('/dashboard'))

    const redirectUrl: URL = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.origin).toBe('http://localhost:3000')
  })

  it('redirige / a /login cuando no hay sesión', () => {
    middleware(makeRequest('/'))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl: URL = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('redirige / a /dashboard cuando hay sesión', () => {
    middleware(makeRequest('/', { session: '1' }))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl: URL = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/dashboard')
  })
})
