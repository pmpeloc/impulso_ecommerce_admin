import type { User, LoginInput, LoginResponse } from '@/types/auth'
import type { Product, ProductsResponse } from '@/types/product'
import type { PipelineJob, PublishLog, PipelineStatusResponse, ApiError } from '@/types/api'

describe('Types', () => {
  it('User se construye correctamente', () => {
    const user: User = {
      id: 'uuid-123',
      email: 'test@test.com',
      tenantId: 'tenant-uuid',
      role: 'operator',
    }
    expect(user.role).toBe('operator')
  })

  it('LoginInput requiere email y password', () => {
    const input: LoginInput = { email: 'a@b.com', password: '123' }
    expect(input.email).toBeDefined()
  })

  it('LoginResponse incluye token y user', () => {
    const res: LoginResponse = {
      token: 'jwt',
      refreshToken: 'refresh',
      user: { id: '1', email: 'a@b.com', tenantId: 'tid', role: 'admin' },
    }
    expect(res.token).toBeDefined()
  })

  it('Product acepta nulls en campos opcionales', () => {
    const product: Product = {
      id: 'p1',
      tenant_id: 't1',
      name: 'Almohada',
      description: null,
      price: 9999,
      status: 'draft',
      image_url: null,
      image_optimized_url: null,
      image_ai_url: null,
      audio_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    expect(product.status).toBe('draft')
  })

  it('ProductsResponse tiene products y total', () => {
    const res: ProductsResponse = { products: [], total: 0 }
    expect(res.total).toBe(0)
  })

  it('PipelineStatusResponse tiene jobs y publishLogs', () => {
    const res: PipelineStatusResponse = { jobs: [], publishLogs: [] }
    expect(res.jobs).toEqual([])
  })

  it('ApiError tiene code, message y statusCode', () => {
    const err: ApiError = {
      code: 'PRODUCT_NOT_FOUND',
      message: 'El producto no existe',
      statusCode: 404,
    }
    expect(err.statusCode).toBe(404)
  })
})
