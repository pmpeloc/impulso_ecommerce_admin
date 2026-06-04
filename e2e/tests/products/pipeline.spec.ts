import { test, expect } from '@playwright/test'
import { authenticate, createTestProduct, apiGet } from '../../helpers/api'
import { loginViaApi } from '../../helpers/auth'
import { cleanupTestProducts } from '../../helpers/db-cleanup'

test.describe('Products — Pipeline', () => {
  test.beforeAll(async () => {
    await authenticate()
    await cleanupTestProducts()
  })

  test.afterAll(async () => {
    await cleanupTestProducts()
  })

  test('@smoke GET /products/:id/pipeline retorna estructura esperada', async () => {
    const product = await createTestProduct('Pipeline Shape Test')

    const res = await apiGet(`/products/${product.id}/pipeline`)
    expect(res.ok).toBeTruthy()

    const body = (await res.json()) as unknown
    expect(body).toMatchObject({
      jobs: expect.any(Array),
      publishLogs: expect.any(Array),
    })
  })

  test('@smoke UI muestra estado terminal cuando producto es published (mocked)', async ({ page }) => {
    await loginViaApi(page)
    const product = await createTestProduct('Pipeline Terminal Mock')

    // Mock GET /products/:id to return 'published' immediately
    await page.route(`**/api/v1/products/${product.id}`, async (route) => {
      if (route.request().url().includes('/pipeline')) {
        await route.continue()
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            price: 9999,
            status: 'published',
            image_url: null,
            image_optimized_url: null,
            description: null,
          },
        }),
      })
    })

    // Mock GET /products/:id/pipeline to return completed jobs
    await page.route(`**/api/v1/products/${product.id}/pipeline`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobs: [{ type: 'ingestion', status: 'done' }],
          publishLogs: [],
        }),
      })
    })

    await page.goto(`/product/${product.id}`)

    // PipelineStatus shows 'published' label
    await expect(page.getByText('¡Publicado!')).toBeVisible()

    // No loading spinner once terminal state is reached
    await expect(
      page.getByRole('status', { name: 'Cargando estado del pipeline' }),
    ).not.toBeVisible()
  })

  test('publish logs de canales son visibles en UI (mocked)', async ({ page }) => {
    await loginViaApi(page)
    const product = await createTestProduct('Pipeline Logs Mock')

    await page.route(`**/api/v1/products/${product.id}`, async (route) => {
      if (route.request().url().includes('/pipeline')) {
        await route.continue()
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            price: 9999,
            status: 'published',
            image_url: null,
            image_optimized_url: null,
            description: null,
          },
        }),
      })
    })

    await page.route(`**/api/v1/products/${product.id}/pipeline`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobs: [{ type: 'ingestion', status: 'done' }],
          publishLogs: [
            { channel: 'whatsapp', status: 'success' },
            { channel: 'facebook', status: 'success' },
            { channel: 'mercadolibre', status: 'failed' },
          ],
        }),
      })
    })

    await page.goto(`/product/${product.id}`)

    // Channel rows in PipelineStatus component
    await expect(page.getByText('WhatsApp')).toBeVisible()
    await expect(page.getByText('Facebook')).toBeVisible()
    await expect(page.getByText('Mercado Libre')).toBeVisible()

    // Status labels from LOG_STATUS_LABEL: success → "Publicado", failed → "Error"
    const publishedBadges = page.locator('span', { hasText: 'Publicado' })
    await expect(publishedBadges.first()).toBeVisible()

    const errorBadge = page.locator('span', { hasText: 'Error' })
    await expect(errorBadge.first()).toBeVisible()
  })
})
