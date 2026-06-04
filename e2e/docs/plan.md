# Prodcast E2E — Plan de Implementación

## [DONE] scaffold-package-json
- Archivo: `e2e/package.json`
- Implementación: package standalone con `@playwright/test`, `@supabase/supabase-js`, `dotenv`; scripts smoke/full/paid/all/report
- Verificación: `npm install` corre sin errores

## [DONE] scaffold-tsconfig
- Archivo: `e2e/tsconfig.json`
- Implementación: `module: CommonJS`, `strict: true`, `esModuleInterop: true`, excluye node_modules y playwright-report
- Verificación: `npx tsc --noEmit` pasa

## [DONE] scaffold-playwright-config
- Archivo: `e2e/playwright.config.ts`
- Implementación: carga `.env.test` con dotenv, `testDir: ./tests`, timeout 60s, `workers: 1`, proyecto chromium con fake media args para @paid; proyecto mobile Pixel 5
- Verificación: `npx playwright test --list` muestra los specs sin error

## [DONE] helpers-api
- Archivo: `e2e/helpers/api.ts`
- Implementación: `authenticate()` (cachea token), `getToken()`, `apiGet()`, `apiPost()`, `createTestProduct()` (con imagen fixture, opcionalmente audio)
- Verificación: función `authenticate()` retorna token válido cuando API está running

## [DONE] helpers-auth
- Archivo: `e2e/helpers/auth.ts`
- Implementación: `loginViaApi(page)` — setea cookie session + navega a /login + inyecta localStorage; depende de `helpers/api.ts`
- Verificación: después de llamar `loginViaApi`, navegar a `/dashboard` no redirige a `/login`

## [DONE] helpers-db-cleanup
- Archivo: `e2e/helpers/db-cleanup.ts`
- Implementación: `cleanupTestProducts()` — borra publish_logs y pipeline_jobs del tenant de test, luego borra products; usa Supabase admin client con SUPABASE_SERVICE_KEY
- Verificación: después de crear un producto y llamar cleanup, la lista de productos queda vacía

## [DONE] tests-auth-login
- Archivo: `e2e/tests/auth/login.spec.ts`
- Implementación: 4 tests — login OK @smoke, credenciales inválidas @smoke, sin password (form validation), ruta protegida sin sesión → redirect
- Verificación: `npx playwright test tests/auth/login.spec.ts`

## [DONE] tests-products-list
- Archivo: `e2e/tests/products/list.spec.ts`
- Implementación: 3 tests — estado vacío @smoke, lista post-create @smoke, badge "Borrador" en producto recién creado
- Verificación: `npx playwright test tests/products/list.spec.ts`

## [DONE] tests-products-create
- Archivo: `e2e/tests/products/create.spec.ts`
- Implementación: 4 tests — flujo completo con imagen @smoke, precio negativo (form validation), API error (page.route mock 400), @paid audio via fake media device
- Verificación: `npx playwright test tests/products/create.spec.ts --grep-invert @paid`

## [DONE] tests-products-pipeline
- Archivo: `e2e/tests/products/pipeline.spec.ts`
- Implementación: 3 tests — @smoke API shape via apiGet, UI terminal state (page.route mock published), publish logs visibles por canal (mocked)
- Verificación: `npx playwright test tests/products/pipeline.spec.ts`

## [DONE] tests-security-isolation
- Archivo: `e2e/tests/security/isolation.spec.ts`
- Implementación: 2 tests — cross-tenant retorna 404 UI (zero UUID), rate limiting 101 requests → 429
- Verificación: `npx playwright test tests/security/isolation.spec.ts`

## [DONE] tests-full-flow-manufacturer
- Archivo: `e2e/tests/full-flow/manufacturer.spec.ts`
- Implementación: @full flujo completo — login, dashboard, nuevo producto (imagen + form), redirect a detalle, pipeline draft → terminal, volver a dashboard y ver producto con badge
- Verificación: `npx playwright test tests/full-flow/manufacturer.spec.ts`
