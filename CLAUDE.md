# Prodcast App — Frontend

> Leer también: `../CLAUDE.md` para contexto global del proyecto y `AGENTS.md` (raíz de este repo) si trabajás con Codex.

## Propósito

PWA (Progressive Web App) para que el fabricante capture productos desde su celular: foto, nombre, descripción por audio y precio. Diseñada para ser simple, rápida y funcionar con conectividad limitada.

---

## Diseño — Design System (Rediseño Hi-Fi ✅ 2026-06-10)

Rediseño completo aplicado vía Claude Design (hi-fi handoff) + Codex. Tema dark-mode, inspirado en Vercel Dashboard:

| Token | Valor |
|-------|-------|
| Brand / primary | `#6366F1` (indigo) |
| Background | `#0A0A0B` |
| Surface (cards/paneles) | `#111113` |
| Border | `#1F1F23` |
| Text primary | `#FAFAFA` |
| Text secondary | `#A1A1AA` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| AI/processing | `#A855F7` |
| Tipografía UI | Inter |
| Tipografía mono (IDs/SKUs) | JetBrains Mono |
| Border radius | 8px |
| Transiciones | 150ms ease |

Tokens definidos en `src/app/globals.css` y `tailwind.config.ts`. Logo oficial en `public/logo-mark.svg`. Shell responsive: sidebar desktop + header/BottomNav mobile (`AppShellDesk`). Fix aplicado: contraste de inputs en login (antes texto blanco sobre blanco).

> **Convención AGENTS.md:** además de este `CLAUDE.md`, el repo tiene `AGENTS.md` en la raíz — es el equivalente para agentes Codex/OpenAI. Mantenerlo sincronizado cuando cambien stack, tipos o el design system.

---

## Stack

| Tecnología | Versión real | Uso |
|-----------|-------------|-----|
| Next.js | 14+ (App Router) | Framework principal |
| TypeScript | strict mode | Tipado completo |
| Tailwind CSS | 3+ | Estilos — mobile-first obligatorio |
| Zustand | ^5.0.14 | Estado global cliente — API v5 (sin `set` wrapper en `create`) |
| React Hook Form | latest | Formularios |
| @hookform/resolvers | ^5.4.0 | Integración Zod↔RHF — requerida |
| Zod | 4.x | Validación de schemas |
| SWR | latest | Fetching y cache de datos |
| next-pwa | 5.6.0 | Service Worker + PWA manifest |

**Testing:**
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Vitest | ^4.1.8 | Test runner (reemplaza Jest) |
| @vitejs/plugin-react | ^6.0.2 | Plugin React para Vitest |
| @testing-library/react | ^16.3.2 | Tests de componentes |
| @testing-library/user-event | ^14.6.1 | Simulación de eventos |
| @testing-library/jest-dom | ^6.9.1 | Matchers DOM adicionales |
| jsdom | ^29.1.1 | Entorno DOM simulado |

---

## Estructura de Carpetas

```
prodcast_app/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Rutas protegidas — layout con pb-20 para BottomNav fijo
│   │   │   ├── layout.tsx             # pb-20 en <main> para no tapar contenido con BottomNav
│   │   │   ├── dashboard/page.tsx
│   │   │   └── product/
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Redirect: sesión → /dashboard, sin sesión → /login
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx             # Variantes: primary, secondary, loading
│   │   │   └── Input.tsx              # Con label y mensaje de error
│   │   │   # Card.tsx y Modal.tsx: pendientes para sprint futuro
│   │   ├── camera/
│   │   │   ├── CameraCapture.tsx
│   │   │   └── ImagePreview.tsx
│   │   ├── audio/
│   │   │   └── AudioRecorder.tsx      # onRecorded va en el componente, no en el hook
│   │   ├── product/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── PipelineStatus.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── BottomNav.tsx          # fixed bottom-0 — requiere pb-20 en layouts padre
│   │
│   ├── hooks/
│   │   ├── useCamera.ts
│   │   ├── useAudioRecorder.ts        # Devuelve { state, seconds, audioUrl, blob, mimeType, startRecording, stopRecording, discard }
│   │   ├── useProducts.ts             # Lista paginada
│   │   ├── useProduct.ts              # Producto individual con polling adaptativo (5s draft/processing, 0 terminal)
│   │   ├── usePipeline.ts             # Pipeline con polling condicional (2s activo, 0 terminal)
│   │   └── useAuth.ts
│   │
│   ├── lib/
│   │   ├── api.ts                     # Cliente HTTP centralizado
│   │   └── auth.ts                    # Helpers de autenticación
│   │   # utils.ts: pendiente para sprint futuro
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   ├── middleware.ts                   # Protección de rutas en Edge runtime (lee cookie session)
│   ├── test/
│   │   └── setup.ts                   # Setup de Vitest — setea env vars manualmente
│   └── styles/
│       └── globals.css
│
├── scripts/
│   └── generate-icons.mjs             # Generador de íconos PNG (sin deps extra)
│
├── public/
│   ├── manifest.json
│   ├── logo-mark.svg                  # Logo oficial del rediseño Hi-Fi (Claude Design)
│   └── icons/
│       ├── icon-192x192.png           # Generado con scripts/generate-icons.mjs
│       └── icon-512x512.png
│
├── e2e/                           # Suite E2E con Playwright (vive en este repo — Opción C)
│   ├── fixtures/
│   │   ├── test-image.jpg         # Imagen fija 400x300px para tests
│   │   └── test-audio.wav         # Tono WAV 5s para tests de Whisper (@paid)
│   ├── helpers/
│   ├── tests/
│   │   ├── auth/
│   │   ├── products/
│   │   └── full-flow/
│   ├── docs/
│   ├── .env.test.example
│   └── CLAUDE.md                  # Documentación completa de la suite E2E
│
├── docs/
│   ├── spec.md
│   ├── plan.md
│   └── progress.md
│
├── vitest.config.ts                   # jsdom, alias @/, setup file
├── vitest-env.d.ts                    # Tipos globales de Vitest
├── .env.local.example
├── next.config.mjs                    # ESM — no CommonJS
├── tailwind.config.ts
└── tsconfig.json
```

> **Nota .gitignore:** `sw.js` y `workbox-*.js` en `public/` son generados por `next build` — no commitear.

---

## Arquitectura PWA

### Captura de fotos
Se usa `<input type="file" accept="image/*" capture="environment">` — **no** `getUserMedia`.
Decisión tomada en brainstorming: funciona en iOS Safari sin requerir permisos explícitos.

### Audio
`MediaRecorder API` — detección automática de mimeType (`audio/webm` en Chrome, `audio/mp4` en iOS Safari).

### Service Worker
`next-pwa@5.6.0` — desactivado en `development`. Solo se genera en `next build`.

### Configuración PWA (next.config.mjs — ESM)
```js
import withPWAInit from 'next-pwa'
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})
export default withPWA({ /* next config */ })
```

---

## Mecanismo de Autenticación

Triple capa para compatibilidad con Edge runtime y client-side:

**Capa 1 — Cookie** (leída por `middleware.ts` en Edge runtime):
- `session=1` — seteada client-side en login (`document.cookie`)
- Path `/`, SameSite `Lax`
- El middleware redirige a `/login` si esta cookie no existe

**Capa 2 — Layout client-side** (`(auth)/layout.tsx` — `'use client'`):
- Verifica el token JWT de Zustand vía `useAuth()`
- Si el token es `null` después de hidratar → `router.replace('/login')`
- Protección redundante: cubre casos donde la cookie existe pero el token ya no

**Capa 3 — localStorage** (leído por el cliente vía Zustand):
- Las claves `TOKEN_KEY` y `REFRESH_TOKEN_KEY` son constantes exportadas desde `src/lib/api.ts` (no desde `auth.ts`)
- `prodcast_token` — JWT de acceso
- `prodcast_refresh_token` — refresh token guardado pero **auto-refresh NO implementado**

> ⚠️ **Deuda técnica:** cuando el JWT expira, el usuario pierde la sesión sin aviso. El endpoint `POST /api/v1/auth/refresh` existe en la API pero no se consume. Implementar en Sprint 2.

---

## Tipos

### `src/types/product.ts`

> **Convención de nombres:** snake_case — los campos llegan directamente de Supabase sin transformación.

```typescript
type ProductStatus = 'draft' | 'processing' | 'published' | 'failed'

interface Product {
  id: string
  tenant_id: string
  name: string
  description_transcription: string | null  // raw: Whisper o texto manual
  description_optimized: string | null      // processed: versión AI (null hasta que pipeline procese)
  price: number
  status: ProductStatus
  image_url: string | null
  image_optimized_url: string | null
  image_ai_url: string | null
  audio_url: string | null
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  products: Product[]
  total: number
}
```

> **Convención en UI:** mostrar `description_optimized` si existe, con fallback a `description_transcription`. Nunca mostrar null al usuario.
> **Nota:** `slug` existe en la DB pero no es parte del contrato con la PWA — la app navega por `id`. El slug solo importa al storefront.

### `src/types/auth.ts`
```typescript
interface User {
  id: string
  email: string
  tenantId: string
  role: 'admin' | 'operator'   // union type estricto, no string
}

interface LoginInput {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}
```

### `src/types/api.ts`

> **Convención de nombres:** snake_case — excepción: `publishLogs` (camelCase) en `PipelineStatusResponse`, porque la API hace esa única transformación en el endpoint `/products/:id/pipeline`.

```typescript
type PipelineJobStatus = 'pending' | 'processing' | 'done' | 'failed'
type PipelineJobType   = 'ingestion' | 'publish'
type PublishChannel    = 'whatsapp' | 'facebook' | 'mercadolibre' | 'ecommerce'
type PublishLogStatus  = 'success' | 'failed'

interface PipelineJob {
  id: string
  product_id: string
  type: PipelineJobType
  status: PipelineJobStatus
  error: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface PublishLog {
  id: string
  product_id: string
  channel: PublishChannel
  status: PublishLogStatus
  external_id: string | null
  error: string | null
  published_at: string | null
}

interface PipelineStatusResponse {
  jobs: PipelineJob[]
  publishLogs: PublishLog[]   // camelCase — la API mapea publish_logs → publishLogs
}

interface ApiError {
  code: string
  message: string
  statusCode: number
}
```

---

## Hooks de Polling

### `useProduct(id)`
Polling adaptativo sobre `GET /products/:id`. Usa forma de función en `refreshInterval` para leer el estado del dato actual (no del prop externo):
```typescript
refreshInterval: (current) => {
  const status = current?.product?.status
  return status && TERMINAL_STATUSES.includes(status) ? 0 : 5000
}
```
- 5000ms mientras `status` es `draft` o `processing`
- 0 (detiene el polling) cuando `status` es `published` o `failed`

### `usePipeline(productId, productStatus)`
Polling condicional sobre `GET /products/:id/pipeline`:
- `refreshInterval: 2000` mientras no es estado terminal
- `refreshInterval: 0` cuando `published` o `failed`

> **Nota para la API:** el frontend hace polling frecuente de `/products/:id`. Con el rate limit actual de 500/min para `/products`, el headroom es suficiente para el MVP pero calcular si escala con múltiples productos abiertos simultáneamente.

---

## Comunicación con la API

### Cliente HTTP centralizado (`src/lib/api.ts`)
- Base URL desde `NEXT_PUBLIC_API_URL`
- JWT token en header `Authorization: Bearer <token>`
- Manejo de errores tipado con `ApiError`
- Nunca llamadas `fetch` directas fuera de este módulo

### CORS
Configurado en el backend vía `CORS_ORIGIN`. En desarrollo: `http://localhost:3000`.

### Endpoints consumidos

| Método | Endpoint | Uso | Notas |
|--------|----------|-----|-------|
| POST | `/auth/login` | Login | Response: `{ token, refreshToken, user: { id, email, tenantId, role } }` |
| GET | `/products` | Lista paginada | |
| POST | `/products` | Crear producto | multipart/form-data — `price` como string, la API coerce |
| GET | `/products/:id` | Detalle | Polling 5s hasta estado terminal |
| GET | `/products/:id/pipeline` | Pipeline status | Polling 2s hasta estado terminal |

---

## Patrones de Código

### Zod v4 + RHF — campos numéricos
`z.coerce.number()` genera mismatch de tipos con RHF en Zod v4. Usar:
```typescript
price: z.preprocess(
  (v) => (typeof v === 'number' && isNaN(v) ? 0 : v),
  z.number().positive('El precio debe ser mayor a 0')
)
// En el campo: {...register('price', { valueAsNumber: true })}
```

### AudioRecorder — separación hook/componente
El hook `useAudioRecorder` no recibe callbacks. Devuelve estado:
```typescript
useAudioRecorder(): {
  state: 'idle' | 'recording' | 'recorded'
  seconds: number
  audioUrl: string | null
  blob: Blob | null
  mimeType: string        // '' (empty string) si MediaRecorder no disponible — nunca null
  startRecording: () => void
  stopRecording: () => void
  discard: () => void
}
```
El componente `<AudioRecorder onRecorded={fn}>` llama al callback cuando el usuario confirma con "Usar grabación".

### Layout autenticado — espacio para BottomNav
`BottomNav` usa `fixed bottom-0`. Todo `<main>` en layouts autenticados debe tener `pb-20` para que el contenido no quede tapado.

---

## Patrones de Testing

### Setup de env vars
Vitest no carga `.env.local`. Las variables se setean en `src/test/setup.ts`:
```typescript
process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost:3001'
```

### vi.hoisted() — mocks de clases ES6
Obligatorio cuando una variable se usa dentro del factory de `vi.mock()` (el factory se eleva al tope del archivo):
```typescript
const { MockClass } = vi.hoisted(() => {
  class MockClass { method = vi.fn() }
  return { MockClass }
})
vi.mock('module', () => ({ default: MockClass }))
```

### mockReset() vs mockClear()
- `mockClear()` — limpia solo las llamadas (contadores). Usar cuando el return value no cambia entre tests.
- `mockReset()` — limpia llamadas Y la implementación. Usar en `beforeEach` cuando un test cambia el return value del mock.

### Middleware Next.js
Testear importando la función directamente con mocks de `NextRequest`/`NextResponse`, no via HTTP.

---

## Convenciones de Código

### TypeScript
- `strict: true` siempre
- No usar `any` — justificar con comentario si es inevitable
- Props de componentes tipadas con `interface`, no `type`

### Componentes
- Functional components únicamente
- Un componente por archivo (PascalCase)
- Props interface justo arriba del componente
- Sin lógica de negocio en componentes — usar hooks

### Estilos
- Solo Tailwind CSS
- Mobile-first obligatorio
- Clases ordenadas: layout → spacing → typography → colors → states

### Errores
- Errores de API siempre capturados y mostrados al usuario
- No `console.log` en producción
- Loading states explícitos en toda operación async

---

## Variables de Entorno

```bash
# .env.local.example
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Prodcast
```

---

## Decisiones de producto documentadas

### `ACTIVE_CHANNELS` en `PipelineStatus`
El componente `PipelineStatus` solo muestra los canales `['whatsapp', 'facebook', 'mercadolibre']`. El canal `ecommerce` existe como `PublishChannel` válido pero está excluido intencionalmente de la UI — el ecommerce propio no requiere mostrar estado de publicación en la PWA del fabricante.

---

## Pendientes documentados

| Item | Estado |
|------|--------|
| `src/app/page.tsx` | Redirect implementado: con sesión → `/dashboard`, sin sesión → `/login` (middleware + fallback server component) |
| `src/components/ui/Card.tsx` | No implementado — no fue necesario en Sprint 1 |
| `src/components/ui/Modal.tsx` | No implementado — no fue necesario en Sprint 1 |
| `src/lib/utils.ts` | No implementado — no fue necesario en Sprint 1 |
| Auto-refresh de token | `prodcast_refresh_token` guardado pero no consumido — implementar en Sprint 2 |
| `src/hooks/useCamera.ts` | Implementado pero **no usado** — `NewProductPage` maneja el estado de imagen directamente sin este hook. Evaluar si eliminar o adoptar en Sprint 2 |
| `e2e/` | Excluido de `tsconfig.json` (type-check) y `vitest.config.ts` (discovery) — Playwright corre con su propio runner/dependencias |
| `next/image` | Adoptado en login, header, captura, preview y detalle de producto. Previews `blob:` y URLs dinámicas usan `unoptimized` |

### Deuda funcional del rediseño Hi-Fi (handoff Claude Design)

El handoff incluye pantallas/interacciones que requieren lógica o endpoints nuevos — no implementadas, solo visual estático donde aplica:

| Item | Detalle |
|------|---------|
| Dashboard — búsqueda y filtros | Búsqueda por nombre, filtros por estado/canal y selección en lote requieren estado adicional + posible endpoint con query params |
| Dashboard — canal por fila | Mostrar canal de publicación por producto en la tabla requiere exponer ese dato desde la API |
| Captura — preview en vivo | Vista previa textual del producto mientras se completa el formulario — requiere compartir estado entre pasos |
| Captura — guardar borrador | Botón "Guardar borrador" requiere endpoint o flujo de creación parcial |
| Detalle — edición completa | Editar nombre/precio/descripción, cambiar foto, asignar SKU y guardar cambios — requiere endpoints `PATCH /products/:id` (no existe aún) |
| Detalle — reprocesar | Botón para re-disparar el pipeline de un producto — requiere endpoint nuevo |
| Detalle — publicar manualmente | Trigger manual de publicación por canal — requiere endpoint nuevo |
| Pipeline — reintentos | Reintentar un job o canal específico tras fallo — requiere endpoint nuevo. `ecommerce` sigue excluido de la UI por decisión de producto (sin cambios) |

---

## Instrucciones para Superpowers

Al iniciar trabajo en este repo:
1. Leer este `CLAUDE.md` y `../CLAUDE.md` antes de cualquier acción
2. Al finalizar brainstorming → guardar spec en `docs/spec.md`
3. Al generar plan → guardar en `docs/plan.md`:
   ```
   ## [PENDING] nombre-de-tarea
   - Archivo: src/...
   - Test primero: qué testear
   - Implementación: qué construir
   - Verificación: cómo confirmar que funciona
   ```
4. Al completar cada tarea → actualizar `docs/progress.md`:
   ```
   [DONE] nombre-tarea — commit: abc1234
   [IN PROGRESS] nombre-tarea
   [PENDING] nombre-tarea
   ```
5. TDD estricto: RED → GREEN → REFACTOR → COMMIT
6. Para mocks de clases ES6: usar `vi.hoisted()` — ver sección Patrones de Testing
7. Para campos numéricos con Zod v4 + RHF: usar `z.preprocess` + `valueAsNumber` — ver sección Patrones de Código
8. Nunca modificar `docs/plan.md` una vez aprobado
