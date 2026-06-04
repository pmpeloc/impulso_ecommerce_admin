import fs from 'fs'
import path from 'path'

const API_BASE = process.env.API_BASE_URL!

let _token: string | null = null

export function getToken(): string {
  if (!_token) throw new Error('Not authenticated — call authenticate() first')
  return _token
}

/** Calls /auth/login and caches the token. Safe to call multiple times. */
export async function authenticate(): Promise<string> {
  if (_token) return _token

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    }),
  })
  if (!res.ok) {
    throw new Error(`authenticate() failed: ${res.status} ${await res.text()}`)
  }
  const { token } = (await res.json()) as { token: string }
  _token = token
  return _token
}

export async function apiGet(endpoint: string, token = getToken()): Promise<Response> {
  return fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function apiPost(
  endpoint: string,
  body: unknown,
  token = getToken(),
): Promise<Response> {
  return fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
}

/** Creates a product via API using the test image fixture. */
export async function createTestProduct(
  name = 'Test Almohada',
  price = 9999,
  withAudio = false,
): Promise<{ id: string; status: string; name: string }> {
  const token = getToken()

  const imagePath = path.join(__dirname, '../fixtures/test-image.jpg')
  const imageBuffer = fs.readFileSync(imagePath)

  const formData = new FormData()
  formData.append('name', name)
  formData.append('price', String(price))
  formData.append(
    'image',
    new Blob([imageBuffer], { type: 'image/jpeg' }),
    'test-image.jpg',
  )

  if (withAudio) {
    const audioPath = path.join(__dirname, '../fixtures/test-audio.wav')
    const audioBuffer = fs.readFileSync(audioPath)
    formData.append(
      'audio',
      new Blob([audioBuffer], { type: 'audio/wav' }),
      'test-audio.wav',
    )
  }

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`createTestProduct() failed: ${res.status} ${await res.text()}`)
  }
  const { product } = (await res.json()) as { product: { id: string; status: string; name: string } }
  return product
}
