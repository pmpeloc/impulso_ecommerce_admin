export interface User {
  id: string
  email: string
  tenantId: string
  role: 'admin' | 'operator'
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  token: string
  refreshToken?: string
}
