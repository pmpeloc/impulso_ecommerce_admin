# Prodcast App — Frontend

> Leer también: `../CLAUDE.md` para contexto global del proyecto.

## Propósito

PWA (Progressive Web App) para que el fabricante capture productos desde su celular: foto, nombre, descripción por audio y precio. Diseñada para ser simple, rápida y funcionar con conectividad limitada.

---

## Stack

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 14+ (App Router) | Framework principal |
| TypeScript | strict mode | Tipado completo |
| Tailwind CSS | 3+ | Estilos |
| Zustand | latest | Estado global cliente |
| React Hook Form + Zod | latest | Formularios + validación |
| SWR | latest | Fetching y cache de datos |
| next-pwa | latest | Service Worker + PWA manifest |

---

## Estructura de Carpetas

```
prodcast_app/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Rutas protegidas por auth
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Lista de productos del tenant
│   │   │   └── product/
│   │   │       ├── new/
│   │   │       │   └── page.tsx    # Captura de nuevo producto
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Detalle / edición
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                # Redirect a dashboard o login
│   │
│   ├── components/
│   │   ├── ui/                     # Componentes base reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── camera/
│   │   │   ├── CameraCapture.tsx   # Acceso a cámara del dispositivo
│   │   │   └── ImagePreview.tsx    # Preview + opción de retomar foto
│   │   ├── audio/
│   │   │   └── AudioRecorder.tsx   # Grabación de descripción por voz
│   │   ├── product/
│   │   │   ├── ProductForm.tsx     # Formulario completo de producto
│   │   │   ├── ProductCard.tsx     # Card en listado
│   │   │   └── PipelineStatus.tsx  # Estado de publicación por canal
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── BottomNav.tsx       # Navegación móvil
│   │
│   ├── hooks/
│   │   ├── useCamera.ts            # Hook para MediaDevices API
│   │   ├── useAudioRecorder.ts     # Hook para MediaRecorder API
│   │   ├── useProducts.ts          # SWR hook para productos
│   │   └── useAuth.ts              # Hook de sesión
│   │
│   ├── lib/
│   │   ├── api.ts                  # Cliente HTTP centralizado (fetch wrapper)
│   │   ├── auth.ts                 # Helpers de autenticación
│   │   └── utils.ts                # Utilidades generales
│   │
│   ├── types/
│   │   ├── product.ts              # Tipos de producto y pipeline
│   │   ├── api.ts                  # Tipos de respuestas API
│   │   └── auth.ts                 # Tipos de sesión y usuario
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # App icons (múltiples tamaños)
│
├── docs/                           # Bridge con Cowork (NO commitear contenido sensible)
│   ├── spec.md                     # Spec de feature actual
│   ├── plan.md                     # Plan generado por Superpowers
│   └── progress.md                 # Estado de tareas
│
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Arquitectura PWA

### Capacidades requeridas
- **Camera API** (`getUserMedia`) — captura de fotos desde cámara trasera
- **MediaRecorder API** — grabación de audio para descripción
- **Service Worker** — cache offline, instalable en home screen
- **Web App Manifest** — icono, nombre, theme color, display: standalone

### Configuración PWA (next.config.js)
```js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})
```

### Manifest esencial
```json
{
  "name": "Prodcast",
  "short_name": "Prodcast",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/dashboard",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

---

## Flujo Principal del Usuario

```
Login → Dashboard (lista de productos)
  → [+ Nuevo Producto]
    → Captura foto (CameraCapture)
    → Preview foto (ImagePreview)
    → Formulario: nombre + precio
    → Descripción: texto O grabación de audio
    → [Publicar]
      → API POST /products
      → UI muestra PipelineStatus (procesando → publicado por canal)
```

---

## Comunicación con la API

### Cliente HTTP centralizado (`src/lib/api.ts`)
- Base URL desde `NEXT_PUBLIC_API_URL`
- JWT token en header `Authorization: Bearer <token>`
- Manejo de errores tipado con tipos `ApiError`
- Nunca llamadas fetch directas fuera de este módulo

### CORS
Configurado en el backend vía `CORS_ORIGIN`. En desarrollo apunta a `http://localhost:3000`.

### Endpoints consumidos

| Método | Endpoint | Uso | Notas |
|--------|----------|-----|-------|
| POST | `/auth/login` | Login del fabricante | Response incluye `user.role` |
| GET | `/products` | Lista de productos del tenant | |
| POST | `/products` | Crear producto | multipart/form-data — `price` se envía como string, la API lo coerce |
| GET | `/products/:id` | Detalle de producto | Retorna `status: 'draft'` inmediatamente tras el POST |
| GET | `/products/:id/pipeline` | Estado de publicación por canal | Hacer polling para ver progreso real — intervalo recomendado: 2s |

---

## Convenciones de Código

### TypeScript
- `strict: true` siempre
- No usar `any`. Si es necesario, justificar con comentario
- Props de componentes siempre tipadas con `interface`, no `type`
- Respuestas API siempre tipadas con tipos de `src/types/api.ts`

### Componentes
- Functional components únicamente
- Un componente por archivo
- Nombre del archivo = nombre del componente (PascalCase)
- Props interface justo arriba del componente en el mismo archivo
- Evitar lógica de negocio en componentes — usar hooks

### Estilos
- Solo Tailwind CSS, sin CSS modules ni styled-components
- Mobile-first obligatorio (el 100% del uso es en celular)
- Clases ordenadas: layout → spacing → typography → colors → states

### Manejo de errores
- Todos los errores de API capturados y mostrados al usuario
- Nunca `console.log` en producción — usar `console.error` solo para errores reales
- Loading states explícitos en toda operación async

---

## Testing

- **Unit tests**: Vitest
- **Component tests**: React Testing Library
- **Convención TDD**: escribir el test ANTES del componente (Superpowers lo enforcea)
- Archivos de test: `ComponentName.test.tsx` junto al componente

---

## Tipos alineados con la API (Sprint 1)

### `src/types/auth.ts`
```typescript
interface User {
  id: string
  email: string
  tenantId: string
  role: string   // 'admin' | 'operator' — incluido en respuesta de login
}
```

### `src/types/api.ts`
```typescript
// Respuesta de GET /products/:id/pipeline
interface PipelineStatusResponse {
  jobs: PipelineJob[]
  publishLogs: PublishLog[]   // camelCase — verificar alineación con la API
}
```

### `src/components/product/PipelineStatus.tsx`
El producto retorna `status: 'draft'` inmediatamente tras el POST. Para ver el progreso real del pipeline hacer polling a `GET /products/:id/pipeline` cada 2 segundos hasta que `product.status` sea `'published'` o `'failed'`.

---

## Variables de Entorno

```bash
# .env.local.example
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Prodcast
```

---

## Instrucciones para Superpowers

Al iniciar trabajo en este repo:
1. Leer este `CLAUDE.md` y `../CLAUDE.md` antes de cualquier acción
2. Al finalizar brainstorming → guardar spec en `docs/spec.md`
3. Al generar plan → guardar en `docs/plan.md` con este formato por tarea:
   ```
   ## [PENDING] nombre-de-tarea
   - Archivo: src/components/...
   - Test primero: describe qué testear
   - Implementación: qué construir
   - Verificación: cómo confirmar que funciona
   ```
4. Al completar cada tarea → actualizar `docs/progress.md`:
   ```
   [DONE] nombre-tarea — commit: abc1234
   [IN PROGRESS] nombre-tarea
   [PENDING] nombre-tarea
   ```
5. TDD estricto: RED → GREEN → REFACTOR → COMMIT en cada tarea
6. Nunca modificar `docs/plan.md` una vez aprobado — solo actualizar `docs/progress.md`
