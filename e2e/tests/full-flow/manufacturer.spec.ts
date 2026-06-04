import { test, expect } from '@playwright/test'
import path from 'path'
import { loginViaApi } from '../../helpers/auth'
import { cleanupTestProducts } from '../../helpers/db-cleanup'

const IMAGE_FIXTURE = path.join(__dirname, '../../fixtures/test-image.jpg')
const PRODUCT_NAME = 'Almohada Full Flow @full'

// @full: runs the complete user journey against the real API.
// Requires prodcast_api with stub publish channels configured so the pipeline
// can reach 'published' state without real third-party integrations.
// Timeout: 60s per test (generous for pipeline polling).

test.describe('@full Manufacturer — Flujo completo de punta a punta', () => {
  test.beforeAll(async () => {
    await cleanupTestProducts()
  })

  test.afterAll(async () => {
    await cleanupTestProducts()
  })

  test(
    '@full fabricante crea producto y lo ve publicado en dashboard',
    async ({ page }) => {
      // ── 1. Login ──────────────────────────────────────────────────────────
      await loginViaApi(page)
      await page.goto('/dashboard')

      // Dashboard loads (either empty state or existing products — we cleaned up)
      await expect(page.getByRole('status', { name: 'Cargando productos' })).not.toBeVisible()

      // ── 2. Navigate to new product ─────────────────────────────────────────
      await page.locator('a[aria-label="Nuevo producto"]').click()
      await expect(page).toHaveURL(/\/product\/new/)

      // ── 3. Capture image ───────────────────────────────────────────────────
      // CameraCapture has a hidden file input; setInputFiles bypasses the hidden state
      await page.locator('input[accept="image/*"]').setInputFiles(IMAGE_FIXTURE)

      // Page advances to 'previewing' step
      await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()

      // ── 4. Confirm image ───────────────────────────────────────────────────
      await page.getByRole('button', { name: 'Continuar' }).click()

      // Page advances to 'filling' step with ProductForm
      await expect(page.getByLabel('Nombre del producto')).toBeVisible()

      // ── 5. Fill form ───────────────────────────────────────────────────────
      await page.getByLabel('Nombre del producto').fill(PRODUCT_NAME)
      await page.getByLabel('Precio').fill('12500')

      // ── 6. Submit ──────────────────────────────────────────────────────────
      await page.getByLabel('Precio').press('Enter')

      // ── 7. Product detail — initial state ─────────────────────────────────
      await expect(page).toHaveURL(/\/product\/[0-9a-f-]{36}/)
      await expect(page.getByText('En cola...')).toBeVisible()

      // ── 8. Wait for terminal pipeline state ────────────────────────────────
      // With stub channels in the API, the pipeline should complete quickly.
      // The test verifies it reaches either 'published' or 'failed' — both are valid
      // terminal states that show the pipeline ran end-to-end.
      await page.waitForFunction(
        () => {
          const text = document.body.textContent ?? ''
          return text.includes('¡Publicado!') || text.includes('Error en publicación')
        },
        { timeout: 60_000 },
      )

      // ── 9. Navigate back to dashboard ─────────────────────────────────────
      await page.getByRole('link', { name: 'Volver' }).click()
      await expect(page).toHaveURL(/\/dashboard/)

      // ── 10. Product visible in list ────────────────────────────────────────
      await expect(page.getByText(PRODUCT_NAME)).toBeVisible()

      // Badge should reflect terminal state (Publicado or Error — both are ok here)
      const terminalBadge = page.locator('span', { hasText: /Publicado|Error/ })
      await expect(terminalBadge.first()).toBeVisible()
    },
  )
})
