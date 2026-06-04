import { test, expect } from '@playwright/test'

test.describe('Auth — Login', () => {
  test('@smoke login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel('Contraseña').fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('@smoke credenciales inválidas muestran error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Contraseña').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('p.text-red-500')).toBeVisible()
  })

  test('enviar sin contraseña muestra error de validación sin llamar a la API', async ({ page }) => {
    await page.goto('/login')

    let apiCalled = false
    await page.route('**/auth/login', () => {
      apiCalled = true
    })

    await page.getByLabel('Email').fill('test@example.com')
    // Leave password empty
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    // Zod validation should fire before any API call
    await expect(page.locator('p.text-red-500').first()).toBeVisible()
    expect(apiCalled).toBe(false)
    await expect(page).toHaveURL(/\/login/)
  })

  test('ruta protegida sin sesión redirige a login', async ({ page }) => {
    // No cookies set — middleware should redirect
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/product/new')
    await expect(page).toHaveURL(/\/login/)
  })
})
