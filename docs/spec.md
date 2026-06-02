# Prodcast Frontend — Spec Sprint 1 (MVP)

## Objetivo

Construir la PWA completa que permite al fabricante capturar y publicar productos desde su celular. El sistema se conecta a `prodcast_api` corriendo en `http://localhost:3001` (producción: variable de entorno `NEXT_PUBLIC_API_URL`).

---

## Alcance del Sprint 1

### Incluido
- Scaffold del proyecto (Next.js 14, TypeScript strict, Tailwind CSS, Vitest, next-pwa)
- Autenticación: login, sesión JWT en localStorage, rutas protegidas
- Dashboard: listado de productos del tenant con estado de publicación
- Flujo de nuevo producto: foto → preview → formulario → audio opcional → publicar
- Pipeline status: componente con polling para ver el estado por canal
- Vista de detalle de producto
- Layout móvil (Header + BottomNav)
- Configuración PWA (manifest + service worker)

### Fuera del scope
- Edición de productos existentes
- Notificaciones push
- Modo offline con sync posterior
- Google Drive
- Publicadores reales (stubs en la API)

---

## Stack

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Next.js | 14+ (App Router) | Framework principal |
| TypeScript | strict | Tipado |
| Tailwind CSS | 3+ | Estilos (mobile-first) |
| Zustand | latest | Estado global (auth) |
| React Hook Form + Zod | latest | Formularios + validación |
| SWR | latest | Fetching, cache y polling |
| next-pwa | latest | Service worker + manifest |
| Vitest + RTL | latest | Tests unitarios y de componentes |

---

## Arquitectura

### Rutas

```
/                    → redirect a /dashboard o /login (según sesión)
/login               → página pública
/(auth)/
  /dashboard         → lista de productos (protegida)
  /product/new       → flujo de captura (protegida)
  /product/[id]      → detalle + pipeline status (protegida)
```

### Protección de rutas

`middleware.ts` de Next.js intercepta todas las rutas `/(auth)/*`. Si no existe token JWT en `localStorage` (vía cookie de sesión para que el middleware lo pueda leer), redirige a `/login`.

**Patrón de sesión:**
- Login → guarda `token` y `refreshToken` en `localStorage`
- Middleware de Next.js usa una cookie `session` (valor: `"1"`) que se setea desde el cliente al hacer login, para que el middleware detecte si hay sesión activa
- El token JWT real viaja solo desde el cliente en los headers de la API

### Estado global (Zustand)

```typescript
interface AuthStore {
  user: User | null
  token: string | null
  login: (credentials: LoginInput) => Promise<void>
  logout: () => void
}
```

### Cliente HTTP (`src/lib/api.ts`)

- Base URL desde `NEXT_PUBLIC_API_URL`
- JWT desde store de Zustand en cada request
- Errores tipados con `ApiError`
- Nunca usar `fetch` directamente fuera de este módulo

---

## Flujo Principal del Usuario

```
[Login] 
  → Ingresa email + password
  → POST /api/v1/auth/login
  → Guarda token, redirige a /dashboard

[Dashboard]
  → GET /api/v1/products (SWR, paginado)
  → Muestra ProductCard por cada producto (nombre, precio, status badge)
  → FAB [+] → navega a /product/new

[Nuevo Producto]
  Paso 1 — Foto:
    → <input type="file" accept="image/*" capture="environment">
    → Preview de la foto tomada
    → Botón "Retomar" o "Continuar"
  
  Paso 2 — Datos:
    → Nombre del producto (texto)
    → Precio (número)
    → Descripción (texto opcional)
    → Botón "Agregar descripción por audio" (toggle AudioRecorder)
  
  Paso 3 — Audio (opcional):
    → Botón REC → grabación → detener
    → Preview: puede reproducir o descartar
  
  [Publicar]
    → POST /api/v1/products (multipart/form-data)
    → Body: name, price, description?, image (File), audio? (Blob)
    → Respuesta: { product } con status: 'draft'
    → Redirige a /product/[id] con PipelineStatus activo

[Detalle / Pipeline Status]
  → GET /api/v1/products/:id (datos del producto)
  → GET /api/v1/products/:id/pipeline con polling cada 2s
  → Muestra estado por canal: WhatsApp, Facebook, MercadoLibre
  → Polling se detiene cuando product.status = 'published' | 'failed'
```

---

## Decisiones Técnicas

### Captura de foto
Usar `<input type="file" accept="image/*" capture="environment">` en lugar de `getUserMedia`. Razón: funciona en todos los browsers móviles (incluyendo iOS Safari sin webview especial), no requiere permisos explícitos, y el resultado es idéntico para el usuario.

### Audio en iOS Safari
Safari no soporta `audio/webm`. Usar `MediaRecorder.isTypeSupported()`:
```typescript
const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
```
Whisper acepta ambos formatos.

### JWT storage
Token en `localStorage`. La app es una herramienta interna del fabricante, el riesgo XSS es aceptable para MVP. Para detectar sesión en el middleware de Next.js (que corre en el Edge y no puede leer localStorage), se usa una cookie de sesión `session=1` seteada desde el cliente al hacer login.

### Pipeline polling
SWR con `refreshInterval` condicional:
```typescript
const shouldPoll = product?.status === 'draft' || product?.status === 'processing'
useSWR(url, fetcher, { refreshInterval: shouldPoll ? 2000 : 0 })
```

---

## Tipos de la API (alineados con prodcast_api)

### `src/types/auth.ts`
```typescript
interface User {
  id: string
  email: string
  tenantId: string
  role: 'admin' | 'operator'
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

### `src/types/product.ts`
```typescript
type ProductStatus = 'draft' | 'processing' | 'published' | 'failed'

interface Product {
  id: string
  tenant_id: string
  name: string
  description: string | null
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

### `src/types/api.ts`
```typescript
type PipelineJobStatus = 'pending' | 'processing' | 'done' | 'failed'
type PipelineJobType = 'ingestion' | 'publish'
type PublishChannel = 'whatsapp' | 'facebook' | 'mercadolibre' | 'ecommerce'
type PublishLogStatus = 'success' | 'failed'

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
  publishLogs: PublishLog[]
}

interface ApiError {
  code: string
  message: string
  statusCode: number
}
```

---

## Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Prodcast
```

---

## Criterios de Aceptación

1. El fabricante puede hacer login desde su celular
2. Puede ver la lista de sus productos
3. Puede capturar una foto desde la cámara trasera
4. Puede ingresar nombre, precio y descripción (texto o audio)
5. Puede publicar el producto y ver el progreso por canal en tiempo real
6. La app es instalable en home screen (PWA)
7. Todos los componentes tienen tests que pasan
8. TypeScript sin errores en modo strict
