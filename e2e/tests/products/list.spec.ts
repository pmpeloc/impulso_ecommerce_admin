import { test, expect } from '@playwright/test'
import { loginViaApi } from '../../helpers/auth'
import { createTestProduct } from '../../helpers/api'
import { cleanupTestProducts } from '../../helpers/db-cleanup'

test.describe('Products — List', () => {
  test.beforeAll(async () => {
    await cleanupTestProducts()
  })

  test.afterAll(async () => {
    await cleanupTestProducts()
  })

  // Tests run sequentially (workers: 1). Order matters here:
  // 1. Verify empty state first (DB already cleaned in beforeAll)
  // 2. Create a product and verify it appears
  // 3. Verify the status badge

  test('@smoke estado vacío cuando no hay productos', async ({ page }) => {
    await loginViaApi(page)
    await page.goto('/dashboard')

    // Wait for loading spinner to disappear before asserting empty state
    await expect(page.getByRole('status', { name: 'Cargando productos' })).not.toBeVisible()
    await expect(page.getByText('Aún no hay productos')).toBeVisible()
  })

  test('@smoke lista de productos visible después de crear uno', async ({ page }) => {
    await loginViaApi(page)
    await createTestProduct('Almohada Lista Test')

    await page.goto('/dashboard')

    await expect(page.getByRole('status', { name: 'Cargando productos' })).not.toBeVisible()
    await expect(page.getByText('Almohada Lista Test')).toBeVisible()
  })

  test('badge de status muestra "Borrador" para producto recién creado', async ({ page }) => {
    await loginViaApi(page)
    await page.goto('/dashboard')

    // A newly created product starts as 'draft' → label "Borrador"
    await expect(page.locator('span', { hasText: 'Borrador' }).first()).toBeVisible()
  })
})
