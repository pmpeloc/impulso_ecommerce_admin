import type { ApiError } from '@/types/api'

export const TOKEN_KEY = 'prodcast_token'
export const REFRESH_TOKEN_KEY = 'prodcast_refresh_token'

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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  if (!response.ok) {
    const data = await response.json().catch(() => ({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error del servidor',
        statusCode: response.status,
      },
    }))
    throw new ApiClientError(data.error)
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
