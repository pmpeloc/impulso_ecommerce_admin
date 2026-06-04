import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '.env.test') })

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // Single worker locally keeps shared DB state sequential and module-level
  // token cache coherent; CI can override via env
  workers: process.env.CI ? undefined : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    // Fake media devices so @paid tests can use MediaRecorder without real hardware
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile project disabled for local runs — enable explicitly with --project=mobile
    // {
    //   name: 'mobile',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
})
