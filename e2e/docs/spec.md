# Prodcast E2E — Spec

## Qué construimos

Suite de tests end-to-end con Playwright + TypeScript que prueba el sistema completo como caja negra:
la PWA (`prodcast_app` en `localhost:3000`) consumiendo la API real (`prodcast_api` en `localhost:3001`).

Scope actual: ejecución local. CI/CD en sprint futuro.

---

## Hallazgos del brainstorming

### Mecanismo de auth (doble capa)

El middleware de Next.js lee la cookie `session` (Edge runtime). El cliente Zustand lee
`localStorage.prodcast_token`. En los tests, el auth helper:

1. Llama `POST /api/v1/auth/login` desde Node (fetch nativo)
2. Setea la cookie `session=1` via `context.addCookies()` — antes de cualquier navegación
3. Navega a `/login` (página pública sin redirect) para establecer el origen
4. Inyecta `prodcast_token` en `localStorage` via `page.evaluate()`
5. A partir de ahí, el caller navega al destino protegido

### Selectores identificados (sin data-testid)

El frontend no tiene `data-testid`. Usamos ARIA y texto visible:

| Elemento | Selector Playwright |
|----------|-------------------|
| Login email | `page.getByLabel('Email')` |
| Login password | `page.getByLabel('Contraseña')` |
| Submit login | `page.getByRole('button', { name: 'Iniciar sesión' })` |
| Dashboard vacío | `page.getByText('Aún no hay productos')` |
| FAB nuevo producto | `page.locator('a[aria-label="Nuevo producto"]')` |
| Captura de imagen | `page.locator('input[accept="image/*"]').setInputFiles(path)` |
| Confirmar imagen | `page.getByRole('button', { name: 'Continuar' })` |
| Campo nombre | `page.getByLabel('Nombre del producto')` |
| Campo precio | `page.getByLabel('Precio')` |
| Submit producto | `page.getByRole('button', { name: 'Publicar producto' })` |
| Pipeline draft | `page.getByText('En cola...')` |
| Pipeline published | `page.getByText('¡Publicado!')` |
| Error API en UI | `page.locator('p.text-red-600')` (en /product/new) |
| Error 401 login | `page.locator('p.text-red-500')` (en /login) |

### Captura de imagen (`CameraCapture`)

El input es `className="hidden"` — Playwright puede setear archivos en inputs ocultos directamente.
`input[accept="image/*"]` es el selector. NO se puede usar el botón "Tomar foto" para esto;
se usa `setInputFiles()` en el input directamente.

### Flujo de steps en `/product/new`

`capturing` → `previewing` → `filling`. Los pasos son controlados por state React. Solo se puede
llegar a `filling` habiendo pasado por `capturing`. El test del paso completo sigue el flujo natural.

### Tests con `page.route()` (estados mocked)

Usamos `page.route()` para tests que necesitan estados específicos sin esperar el pipeline real:
- "Error de API en UI": mock de POST /products → 400
- Pipeline tests con publish logs: mock de GET /products/:id/pipeline y GET /products/:id

### Test `@paid` — grabación de audio

`useAudioRecorder` usa `navigator.mediaDevices.getUserMedia`. Para que funcione en Chromium headless:
- `launchOptions.args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']`
- El fake device produce un tono continuo → MediaRecorder genera un Blob válido (no vacío)
- Whisper procesará el audio de prueba → puede retornar `[Music]` o similar, no importa
- El test solo verifica que el pipeline llegue a estado terminal

### Cross-tenant isolation

Se usa el UUID `'00000000-0000-0000-0000-000000000000'` (zero UUID) que no puede existir como
producto válido en ningún tenant. La API debe retornar error → la UI muestra "No se pudo cargar el producto".
No se necesita un segundo tenant de test.

### Rate limiting

El test envía 101 requests concurrentes al endpoint de pipeline y espera al menos un 429.
**Asunción:** el API tiene un burst rate limit < 100 req/s (independiente del limit de 500/min
documentado para el endpoint `/products`). Si el test falla, revisar la config del rate limiter en prodcast_api.

### Aislamiento de datos

- `workers: 1` (local) — todos los tests en el mismo proceso, en serie
- `beforeAll(cleanupTestProducts)` + `afterAll(cleanupTestProducts)` por describe
- El tenant de test NO se borra — solo sus products, publish_logs y pipeline_jobs
- El módulo `helpers/api.ts` cachea el token (evita re-auth entre tests del mismo run)

---

## Cobertura

| Archivo | Tests | Tags |
|---------|-------|------|
| `tests/auth/login.spec.ts` | login OK, 401, form validation, redirect no-auth | `@smoke` |
| `tests/products/list.spec.ts` | estado vacío, lista post-create, badge status | `@smoke` |
| `tests/products/create.spec.ts` | flujo completo imagen, precio inválido, API error, audio | `@smoke` `@paid` |
| `tests/products/pipeline.spec.ts` | API shape, UI terminal state, publish logs | `@smoke` |
| `tests/security/isolation.spec.ts` | cross-tenant 404, rate limiting 429 | — |
| `tests/full-flow/manufacturer.spec.ts` | flujo completo de punta a punta | `@full` |

---

## Constraints

- El root `/` es el scaffold de Next.js (sin redirect) — se usa solo para establecer origen en el auth helper
- El `Input` component usa `useId()` para el `htmlFor` — nunca seleccionar por `#id`
- `ProductCard` no tiene `data-testid` — seleccionar por texto del producto name
- `usePipeline` poll interval: 2s activo, 0 terminal — con `workers: 1` los mocks de `page.route()` son deterministas
