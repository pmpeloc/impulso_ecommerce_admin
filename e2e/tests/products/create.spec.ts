import { test, expect } from '@playwright/test'
import path from 'path'
import { loginViaApi } from '../../helpers/auth'
import { cleanupTestProducts } from '../../helpers/db-cleanup'

const IMAGE_FIXTURE = path.join(__dirname, '../../fixtures/test-image.jpg')

/** Navigates to /product/new, uploads the image fixture, and advances to the filling step. */
async function goToFillingStep(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  await page.goto('/product/new')

  // CameraCapture renders a hidden <input type="file"> — set files directly without clicking
  await page.locator('input[accept="image/*"]').setInputFiles(IMAGE_FIXTURE)

  // After capture, page is on 'previewing' step — confirm the image
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Now on 'filling' step with ProductForm visible
  await expect(page.getByLabel('Nombre del producto')).toBeVisible()
}

test.describe('Products — Create', () => {
  test.afterAll(async () => {
    await cleanupTestProducts()
  })

  test('@smoke crear producto con imagen completa el flujo y abre detalle', async ({ page }) => {
    await loginViaApi(page)
    await goToFillingStep(page)

    await page.getByLabel('Nombre del producto').fill('Almohada Create Test @smoke')
    await page.getByLabel('Precio').fill('9999')
    // Press Enter to submit: avoids the Playwright button-stability retry loop that occurs
    // when React changes the button text to "Cargando..." synchronously on submit,
    // causing getByRole('button', { name: '...' }) to lose its match mid-click.
    await page.getByLabel('Precio').press('Enter')

    // Should redirect to product detail page
    await expect(page).toHaveURL(/\/product\/[0-9a-f-]{36}/)

    // Pipeline section visible — stubs complete in ~200ms so any status is valid
    await expect(
      page.getByText(/En cola\.\.\.|Procesando\.\.\.|¡Publicado!|Error en publicación/),
    ).toBeVisible()
  })

  test('precio negativo muestra error de validación sin llamar a la API', async ({ page }) => {
    await loginViaApi(page)
    await goToFillingStep(page)

    let apiCalled = false
    await page.route('**/api/v1/products', (route) => {
      if (route.request().method() === 'POST') apiCalled = true
      route.continue()
    })

    await page.getByLabel('Nombre del producto').fill('Test Precio Inválido')
    await page.getByLabel('Precio').fill('-500')
    await page.getByLabel('Precio').press('Enter')

    await expect(page.getByText('El precio debe ser mayor a 0')).toBeVisible()
    await expect(page).toHaveURL(/\/product\/new/)
    expect(apiCalled).toBe(false)
  })

  test('error de API se muestra en UI', async ({ page }) => {
    await loginViaApi(page)

    // Mock POST /products to return 400 before navigating
    await page.route('**/api/v1/products', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Imagen requerida',
            statusCode: 400,
          },
        }),
      })
    })

    await goToFillingStep(page)
    await page.getByLabel('Nombre del producto').fill('Test API Error')
    await page.getByLabel('Precio').fill('9999')
    await page.getByLabel('Precio').press('Enter')

    // Error message from API displayed inside the filling step container
    await expect(page.locator('p.text-red-600')).toBeVisible()
    await expect(page).toHaveURL(/\/product\/new/)
  })

  // @paid: costs ~$0.0003 per run (Whisper API call).
  // Uses Chromium fake media device (--use-fake-device-for-media-stream in playwright.config.ts).
  // The fake device produces a continuous tone — Whisper may return [Music] or empty.
  // This test verifies the pipeline completes, not the transcription content.
  test('@paid crear con audio envía al pipeline y llega a estado terminal', async ({ page }) => {
    await loginViaApi(page)
    await goToFillingStep(page)

    // Open the audio recorder
    await page.getByText('Agregar descripción por audio').click()
    await expect(page.getByRole('button', { name: 'Grabar descripción' })).toBeVisible()

    // Start recording — fake media device auto-grants mic permission
    await page.getByRole('button', { name: 'Grabar descripción' }).click()
    await expect(page.getByRole('button', { name: 'Detener' })).toBeVisible()

    // Record for 1 second then stop
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: 'Detener' }).click()

    // Wait for 'recorded' state
    await expect(page.getByRole('button', { name: 'Usar grabación' })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Usar grabación' }).click()

    await expect(page.getByText('✓ Audio grabado')).toBeVisible()

    await page.getByLabel('Nombre del producto').fill('Almohada Audio @paid')
    await page.getByLabel('Precio').fill('7777')
    await page.getByLabel('Precio').press('Enter')

    await expect(page).toHaveURL(/\/product\/[0-9a-f-]{36}/)

    // Wait for pipeline to reach a terminal state (published or failed)
    await page.waitForFunction(
      () => {
        const text = document.body.textContent ?? ''
        return text.includes('¡Publicado!') || text.includes('Error en publicación')
      },
      { timeout: 60_000 },
    )
  })
})
