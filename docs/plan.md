# Prodcast Frontend — Plan Sprint 1

> Generado: 2026-06-02
> Spec: docs/spec.md
> Progreso: docs/progress.md
> TDD estricto: RED → GREEN → REFACTOR → COMMIT en cada tarea

---

## [PENDING] scaffold-project

- Archivo: `/` (raíz de prodcast_app)
- Test primero: verificar que `npx vitest run` corre sin errores y que existe al menos un test dummy
- Implementación: ejecutar `npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git`. Instalar dependencias adicionales: `zustand swr react-hook-form zod next-pwa`. Instalar dev deps: `vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom @testing-library/jest-dom`. Configurar `vitest.config.ts` con environment jsdom y setup file.
- Verificación: `npm run build` sin errores. `npx vitest run` corre el test dummy.

---

## [PENDING] project-config

- Archivo: `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `.env.local`
- Test primero: test de integración mínimo que importa el cliente de API y verifica que la base URL viene de la variable de entorno
- Implementación: configurar `next-pwa` en `next.config.js` (disabled en dev). Verificar `tsconfig.json` con `strict: true`. Crear `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3001`. Crear `.env.local.example`. Crear `public/manifest.json` con name, short_name, display: standalone, start_url: /dashboard, theme_color, background_color, icons placeholder.
- Verificación: `npm run dev` arranca sin errores. La variable de entorno es accesible en el cliente.

---

## [PENDING] types-definition

- Archivo: `src/types/auth.ts`, `src/types/product.ts`, `src/types/api.ts`
- Test primero: test de tipado — crear un objeto de cada tipo y verificar que TypeScript no lanza errores (test de compilación con `tsc --noEmit`)
- Implementación: definir todos los tipos según spec.md. `User`, `LoginInput`, `LoginResponse` en auth.ts. `Product`, `ProductStatus`, `ProductsResponse` en product.ts. `PipelineJob`, `PublishLog`, `PipelineStatusResponse`, `ApiError` en api.ts.
- Verificación: `npx tsc --noEmit` sin errores. Los tipos importan correctamente entre archivos.

---

## [PENDING] api-client

- Archivo: `src/lib/api.ts`
- Test primero: tests unitarios para el cliente HTTP — mockear `fetch` global y verificar: (1) añade Authorization header con token, (2) prefija la base URL correcta, (3) lanza `ApiError` tipado en respuestas 4xx/5xx, (4) lanza `ApiError` en errores de red
- Implementación: función `apiFetch<T>(path, options)` que: lee el token del store de Zustand, añade `Authorization: Bearer <token>`, prefija `NEXT_PUBLIC_API_URL`, parsea la respuesta y lanza `ApiError` en errores. Exportar helpers: `apiGet<T>`, `apiPost<T>`.
- Verificación: todos los tests pasan. No hay llamadas a `fetch` fuera de este módulo en toda la app.

---

## [PENDING] auth-store

- Archivo: `src/lib/auth.ts`, `src/hooks/useAuth.ts`
- Test primero: tests del store — verificar: (1) `login()` llama a `POST /auth/login` con las credenciales, (2) guarda token en localStorage, (3) actualiza el estado del store, (4) `logout()` limpia token y user del store y localStorage
- Implementación: store Zustand con `user`, `token`, `login(credentials)`, `logout()`. En `login`: llamar a `apiPost('/api/v1/auth/login', ...)`, guardar token+refreshToken en localStorage, setear cookie `session=1`. En `logout`: limpiar localStorage y cookie. Hook `useAuth` que expone el store. Hidratar el store desde localStorage en el mount inicial.
- Verificación: tests pasan. El token persiste entre recargas de página.

---

## [PENDING] login-page

- Archivo: `src/app/login/page.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`
- Test primero: tests de `login/page.tsx` — (1) renderiza campos email y password, (2) muestra error de validación si el email es inválido, (3) muestra error de API si las credenciales son incorrectas, (4) redirige a /dashboard en login exitoso
- Implementación: página de login con React Hook Form + Zod (email requerido, password requerido). Llamar a `useAuth().login()` en submit. Mostrar loading state mientras se procesa. Componentes `Button.tsx` (variantes: primary, secondary, loading) y `Input.tsx` (label, error message). Diseño mobile-first centrado.
- Verificación: tests pasan. Se puede hacer login manual en el browser con credenciales reales.

---

## [PENDING] auth-middleware

- Archivo: `src/middleware.ts`, `src/app/(auth)/layout.tsx`
- Test primero: test del middleware — verificar que rutas bajo `/(auth)` sin cookie `session` redirigen a `/login`. Verificar que con cookie `session=1` pasan.
- Implementación: `middleware.ts` con matcher para `/dashboard` y `/product/*`. Si no existe cookie `session`, redirect a `/login`. Layout `(auth)/layout.tsx` que lee el store de Zustand y, si no hay token, redirige a `/login` (segunda capa de protección client-side).
- Verificación: test pasa. Navegar a `/dashboard` sin sesión redirige a `/login` (verificar en browser).

---

## [PENDING] layout-components

- Archivo: `src/components/layout/Header.tsx`, `src/components/layout/BottomNav.tsx`, `src/app/(auth)/layout.tsx`
- Test primero: tests de renderizado — Header muestra el nombre de la app y botón de logout. BottomNav muestra los links de navegación activos según la ruta actual.
- Implementación: `Header.tsx` con logo/nombre "Prodcast" y botón logout que llama a `useAuth().logout()`. `BottomNav.tsx` con links: Dashboard (ícono casa) y Nuevo Producto (ícono +). Usar `usePathname()` para el estado activo. Incluir en `(auth)/layout.tsx`.
- Verificación: tests pasan. El layout se ve correcto en viewport móvil (375px).

---

## [PENDING] dashboard-page

- Archivo: `src/app/(auth)/dashboard/page.tsx`, `src/hooks/useProducts.ts`
- Test primero: tests de `dashboard/page.tsx` — (1) muestra spinner mientras carga, (2) renderiza lista de productos con SWR mockeado, (3) muestra mensaje vacío si no hay productos, (4) muestra error si la API falla
- Implementación: hook `useProducts(page)` con SWR que llama `GET /api/v1/products`. Página con lista de `ProductCard` + paginación simple (Anterior/Siguiente). FAB redondo [+] en esquina inferior derecha que navega a `/product/new`.
- Verificación: tests pasan. Con la API corriendo, la lista de productos se muestra correctamente.

---

## [PENDING] product-card

- Archivo: `src/components/product/ProductCard.tsx`
- Test primero: tests de `ProductCard` — renderiza nombre, precio formateado ($999.99), imagen si existe, y badge de status (colores: draft=gris, processing=amarillo, published=verde, failed=rojo)
- Implementación: card con imagen (o placeholder si `image_url` es null), nombre, precio formateado como moneda ARS, badge de status con color por estado. Click navega a `/product/[id]`.
- Verificación: tests pasan. Se ve correctamente en viewport 375px con producto real.

---

## [PENDING] camera-capture

- Archivo: `src/components/camera/CameraCapture.tsx`, `src/hooks/useCamera.ts`
- Test primero: tests de `CameraCapture` — (1) renderiza el botón de captura, (2) al seleccionar archivo llama al callback `onCapture(file)` con el File, (3) muestra preview de la imagen capturada
- Implementación: componente con `<input type="file" accept="image/*" capture="environment" hidden>`. Botón visible que hace click en el input. Al seleccionar: crear preview con `URL.createObjectURL()`, llamar `onCapture(file)`. Hook `useCamera` encapsula el estado (file, previewUrl, reset).
- Verificación: tests pasan. En celular real, al tocar el botón se abre la cámara trasera.

---

## [PENDING] image-preview

- Archivo: `src/components/camera/ImagePreview.tsx`
- Test primero: tests de `ImagePreview` — (1) muestra la imagen con el src correcto, (2) botón "Retomar" llama a `onRetake()`, (3) botón "Continuar" llama a `onConfirm()`
- Implementación: componente que recibe `previewUrl`, `onRetake`, `onConfirm`. Muestra la imagen a full-width. Dos botones: "Retomar foto" (secundario) y "Continuar" (primario).
- Verificación: tests pasan. La imagen se muestra correctamente después de capturar con la cámara.

---

## [PENDING] audio-recorder

- Archivo: `src/components/audio/AudioRecorder.tsx`, `src/hooks/useAudioRecorder.ts`
- Test primero: tests de `AudioRecorder` — (1) muestra botón "Grabar", (2) al iniciar muestra timer y botón "Detener", (3) al detener llama a `onRecorded(blob)`, (4) puede descartar la grabación, (5) detecta el mimeType correcto según soporte del browser
- Implementación: hook `useAudioRecorder` que maneja `MediaRecorder` con detección de mimeType (`audio/webm` vs `audio/mp4`). Estados: idle, recording, recorded. Timer visible durante la grabación. Componente con botones REC/STOP, preview de audio (`<audio>` tag), botón descartar. Llamar `onRecorded(blob, mimeType)` al terminar.
- Verificación: tests pasan. En iOS Safari graba en mp4, en Chrome graba en webm. La API procesa ambos.

---

## [PENDING] product-form

- Archivo: `src/components/product/ProductForm.tsx`
- Test primero: tests de `ProductForm` — (1) renderiza campos nombre, precio, descripción, (2) validación: nombre requerido, precio requerido y positivo, (3) descripción es opcional, (4) llama a `onSubmit(data)` con datos correctamente tipados, (5) muestra loading state durante el submit
- Implementación: formulario con React Hook Form + Zod schema. Campos: `name` (string, requerido), `price` (number, positivo, requerido), `description` (string, opcional). Props: `onSubmit(data)`, `isLoading`, `audioBlob?` (muestra preview si existe). Botón toggle para mostrar/ocultar `AudioRecorder`.
- Verificación: tests pasan. El formulario valida correctamente y muestra errores en español.

---

## [PENDING] new-product-page

- Archivo: `src/app/(auth)/product/new/page.tsx`
- Test primero: tests de integración de la página — (1) muestra `CameraCapture` como primer paso, (2) después de capturar muestra `ImagePreview`, (3) al confirmar muestra `ProductForm`, (4) al publicar llama a `POST /api/v1/products` con multipart/form-data, (5) redirige a `/product/[id]` después del submit exitoso
- Implementación: máquina de estados simple: `capturing | previewing | filling`. Orquesta `CameraCapture` → `ImagePreview` → `ProductForm`. En submit: construir `FormData` con image (File), audio opcional (Blob), name, price (string), description. Llamar `apiPost('/api/v1/products', formData)`. En éxito: `router.push('/product/' + product.id)`. En error: mostrar mensaje de error.
- Verificación: tests pasan. Flujo completo funciona end-to-end con la API corriendo.

---

## [PENDING] pipeline-status

- Archivo: `src/components/product/PipelineStatus.tsx`, `src/hooks/usePipeline.ts`
- Test primero: tests de `PipelineStatus` — (1) muestra "Procesando..." para jobs con status pending/processing, (2) muestra badge por canal con estado success/failed, (3) detiene el polling cuando product.status es published o failed, (4) muestra el estado general del producto
- Implementación: hook `usePipeline(productId, productStatus)` con SWR + `refreshInterval: productStatus === 'published' || productStatus === 'failed' ? 0 : 2000`. Componente que muestra: sección "Procesamiento" (jobs de ingestion), sección "Publicación por canal" (WhatsApp, Facebook, MercadoLibre con iconos y estado). Colores: processing=amarillo, done/success=verde, failed=rojo.
- Verificación: tests pasan. Con la API corriendo, el estado se actualiza en tiempo real cada 2 segundos.

---

## [PENDING] product-detail-page

- Archivo: `src/app/(auth)/product/[id]/page.tsx`
- Test primero: tests de la página — (1) muestra datos del producto (nombre, precio, imagen, descripción), (2) renderiza `PipelineStatus` con el productId correcto, (3) muestra skeleton loading mientras carga
- Implementación: página que consume `GET /api/v1/products/:id` con SWR. Muestra imagen optimizada (`image_optimized_url`) o imagen original. Datos del producto. Componente `PipelineStatus` debajo. Botón "← Volver" al dashboard.
- Verificación: tests pasan. Al publicar un producto, el usuario llega a esta página y ve el pipeline actualizarse.

---

## [PENDING] pwa-manifest-icons

- Archivo: `public/manifest.json`, `public/icons/`, `src/app/layout.tsx`
- Test primero: verificar que `GET /manifest.json` retorna el JSON correcto y que los iconos existen en los tamaños 192x192 y 512x512
- Implementación: crear iconos SVG → PNG en 192 y 512px (usar un logo placeholder simple). Completar `manifest.json` con paths correctos a los iconos. Añadir `<link rel="manifest">` en `app/layout.tsx`. Añadir meta tags para iOS (`apple-mobile-web-app-capable`, etc.).
- Verificación: Chrome DevTools > Application > Manifest muestra todos los campos sin errores. La app es instalable en Android.

---

## Orden de ejecución recomendado

```
1.  scaffold-project
2.  project-config
3.  types-definition
4.  api-client
5.  auth-store
6.  login-page
7.  auth-middleware
8.  layout-components
9.  dashboard-page
10. product-card
11. camera-capture
12. image-preview
13. audio-recorder
14. product-form
15. new-product-page
16. pipeline-status
17. product-detail-page
18. pwa-manifest-icons
```

Cada tarea: RED (test falla) → GREEN (implementar mínimo) → REFACTOR → COMMIT
