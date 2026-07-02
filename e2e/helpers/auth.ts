import type { Page } from '@playwright/test'
import { authenticate } from './api'

/**
 * Authenticates via API and injects session cookie + localStorage token
 * so the Next.js Edge middleware and Zustand auth store are both satisfied.
 *
 * Uses document.cookie (same mechanism as the real login flow in src/lib/auth.ts)
 * instead of context.addCookies, because addCookies with domain:'localhost' has
 * a Playwright/Chromium quirk where the cookie is not reliably sent on requests
 * to localhost:3000 — causing the middleware to redirect back to /login.
 */
export async function loginViaApi(page: Page): Promise<void> {
  const token = await authenticate()

  // Navigate to /login (public page, same origin) to establish the page context
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  // Set cookie and token in a single evaluate call using document.cookie —
  // same mechanism as src/lib/auth.ts login(), guaranteed to be seen by the middleware
  await page.evaluate((t) => {
    document.cookie = 'session=1; path=/; SameSite=Lax'
    localStorage.setItem('impulso_ecommerce_admin_token', t)
  }, token)
}
