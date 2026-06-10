import type { ApiError } from '@/types/api'
import type { RefreshResponse } from '@/types/auth'

export const TOKEN_KEY = 'prodcast_token'
export const REFRESH_TOKEN_KEY = 'prodcast_refresh_token'
export const SESSION_EXPIRED_EVENT = 'prodcast:session-expired'
export const TOKEN_REFRESHED_EVENT = 'prodcast:token-refreshed'

let refreshPromise: Promise<string> | null = null

export class ApiClientError extends Error {
  code: string
  statusCode: number

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.code = error.code
    this.statusCode = error.statusCode
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function clearSession(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

async function parseApiError(response: Response): Promise<ApiClientError> {
  const data = await response.json().catch(() => ({
    error: {
      code: 'SERVER_ERROR',
      message: 'Error del servidor',
      statusCode: response.status,
    },
  }))

  return new ApiClientError(data.error)
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!storedRefreshToken) {
      throw new ApiClientError({
        code: 'UNAUTHORIZED',
        message: 'La sesión expiró',
        statusCode: 401,
      })
    }

    const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    })

    if (!response.ok) throw await parseApiError(response)

    const data = await response.json() as RefreshResponse
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken ?? storedRefreshToken)
    window.dispatchEvent(new CustomEvent(TOKEN_REFRESHED_EVENT, { detail: data.token }))

    return data.token
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  canRetry = true,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const token = getToken()

  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  })

  if (response.status === 401 && canRetry && !path.startsWith('/api/v1/auth/')) {
    try {
      const currentToken = getToken()
      if (token && currentToken && currentToken !== token) {
        return apiFetch<T>(path, {
          ...options,
          headers: {
            ...(options.headers as Record<string, string> | undefined),
            Authorization: `Bearer ${currentToken}`,
          },
        }, false)
      }

      const refreshedToken = await refreshAccessToken()
      return apiFetch<T>(path, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${refreshedToken}`,
        },
      }, false)
    } catch (error) {
      clearSession()
      throw error
    }
  }

  if (!response.ok) {
    throw await parseApiError(response)
  }

  return response.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (body instanceof FormData) {
    return apiFetch<T>(path, { method: 'POST', body })
  }
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) })
}
