# Prodcast App — Frontend

> Leer también: `../CLAUDE.md` para contexto global del proyecto.

## Propósito

PWA (Progressive Web App) para que el fabricante capture productos desde su celular: foto, nombre, descripción por audio y precio. Diseñada para ser simple, rápida y funcionar con conectividad limitada.

---

## Stack

| Tecnología | Versión real | Uso |
|-----------|-------------|-----|
| Next.js | 14+ (App Router) | Framework principal |
| TypeScript | strict mode | Tipado completo |
| Tailwind CSS | 3+ | Estilos — mobile-first obligatorio |
| Zustand | latest | Estado global cliente |
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
│   │   └── page.tsx                   # ⚠️ Pendiente: redirigir a /dashboard o /login
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
│   └── icons/
│       ├── icon-192x192.png           # Generado con scripts/generate-icons.mjs
│       └── icon-512x512.png
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

Doble capa para compatibilidad con Edge runtime (middleware de Next.js):

**Capa 1 — Cookie** (leída por `middleware.ts` en Edge runtime):
- `session=1` — seteada client-side en login (`document.cookie`)
- Path `/`, SameSite `Lax`
- El middleware redirige a `/login` si esta cookie no existe

**Capa 2 — localStorage** (leído por el cliente vía Zustand):
- `prodcast_token` — JWT de acceso
- `prodcast_refresh_token` — refresh token guardado pero **auto-refresh NO implementado**

> ⚠️ **Deuda técnica:** cuando el JWT expira, el usuario pierde la sesión sin aviso. El endpoint `POST /api/v1/auth/refresh` existe en la API pero no se consume. Implementar en Sprint 2.

---

## Tipos

### `src/types/auth.ts`
```typescript
interface User {
  id: string
  email: string
  tenantId: string
  role: 'admin' | 'operator'   // union type estricto, no string
}
```

### `src/types/api.ts`
```typescript
interface PipelineStatusResponse {
  jobs: PipelineJob[]
  publishLogs: PublishLog[]   // camelCase confirmado — la API mapea desde snake_case
}
```

---

## Hooks de Polling

### `useProduct(id)`
Polling adaptativo sobre `GET /products/:id`:
- `refreshInterval: 5000` mientras `status` es `draft` o `processing`
- `refreshInterval: 0` cuando `status` es `published` o `failed`

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
  mimeType: string | null
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

## Pendientes documentados

| Item | Estado |
|------|--------|
| `src/app/page.tsx` | Sigue siendo el scaffold de Next.js — pendiente redirect a /dashboard o /login |
| `src/components/ui/Card.tsx` | No implementado — no fue necesario en Sprint 1 |
| `src/components/ui/Modal.tsx` | No implementado — no fue necesario en Sprint 1 |
| `src/lib/utils.ts` | No implementado — no fue necesario en Sprint 1 |
| Auto-refresh de token | `prodcast_refresh_token` guardado pero no consumido — implementar en Sprint 2 |

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
