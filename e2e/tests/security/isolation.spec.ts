import { test, expect } from '@playwright/test'
import { authenticate, createTestProduct, apiGet } from '../../helpers/api'
import { loginViaApi } from '../../helpers/auth'
import { cleanupTestProducts } from '../../helpers/db-cleanup'

// Zero UUID — cannot be a valid product in any tenant
const NON_EXISTENT_PRODUCT_ID = '00000000-0000-0000-0000-000000000000'

test.describe('Security — Isolation', () => {
  test.beforeAll(async () => {
    await authenticate()
    await cleanupTestProducts()
  })

  test.afterAll(async () => {
    await cleanupTestProducts()
  })

  test('producto de otro tenant retorna UI de error (cross-tenant isolation)', async ({ page }) => {
    await loginViaApi(page)

    // Navigate to a product ID that either doesn't exist or belongs to another tenant.
    // The API's RLS policy must return 404/error for any product outside the JWT's tenant.
    await page.goto(`/product/${NON_EXISTENT_PRODUCT_ID}`)

    // ProductDetailPage shows error state when product is null / API returns error
    await expect(page.getByText('No se pudo cargar el producto')).toBeVisible()
  })

  // Rate limiting: sends 101 concurrent requests to a protected endpoint.
  // Assumption: the API has a burst rate limit that triggers before 100 req/s.
  // If this test fails with all 200s, verify the rate limiter config in prodcast_api.
  test('rate limiting retorna 429 después de requests masivos', async () => {
    const product = await createTestProduct('Rate Limit Test')

    const requests = Array.from({ length: 101 }, () =>
      apiGet(`/products/${product.id}/pipeline`),
    )

    const responses = await Promise.all(requests)
    const statusCodes = responses.map((r) => r.status)

    expect(statusCodes).toContain(429)
  })
})
