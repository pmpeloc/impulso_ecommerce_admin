# Impulso Ecommerce Admin Frontend — Progress Sprint 1

> Actualizado: 2026-06-02

## Estado

[DONE] scaffold-project — commit: 363b4ea
[DONE] project-config
[DONE] types-definition
[DONE] api-client
[DONE] auth-store
[DONE] login-page
[DONE] auth-middleware
[DONE] layout-components
[DONE] dashboard-page
[DONE] product-card
[DONE] camera-capture
[DONE] image-preview
[DONE] audio-recorder
[DONE] product-form
[DONE] new-product-page
[DONE] pipeline-status
[DONE] product-detail-page
[DONE] pwa-manifest-icons

## Rediseño Hi-Fi (Claude Design)

> Completado: 2026-06-10

[DONE] src/app/globals.css — tokens dark + indigo, Inter/JetBrains Mono, accesibilidad de movimiento y utilidades globales
[DONE] tailwind.config.ts — colores semánticos y sombras del design system Impulso Ecommerce Admin
[DONE] public/logo-mark.svg — logo oficial del handoff incorporado como asset local
[DONE] src/app/layout.tsx — theme color y canvas global oscuro
[DONE] src/app/login/page.tsx — card hi-fi, glow ambiental y contraste correcto en inputs
[DONE] src/app/(auth)/layout.tsx — shell responsive desktop/mobile conservando `pb-20`
[DONE] src/components/layout/Header.tsx — header mobile y sidebar desktop equivalentes a `AppShellDesk`
[DONE] src/components/layout/BottomNav.tsx — navegación mobile translúcida dark
[DONE] src/components/ui/Button.tsx — variantes primary/secondary/ghost del design system
[DONE] src/components/ui/Input.tsx — inputs dark con foco indigo y errores accesibles
[DONE] src/app/(auth)/dashboard/page.tsx — toolbar visual, empty/error/loading states, tabla desktop y FAB mobile
[DONE] src/components/product/ProductCard.tsx — fila desktop/card mobile con precio mono, ID y status badge
[DONE] src/app/(auth)/product/new/page.tsx — captura responsive y split formulario/foto preview
[DONE] src/components/camera/CameraCapture.tsx — dropzone/captura hi-fi
[DONE] src/components/camera/ImagePreview.tsx — preview oscuro y acciones responsive
[DONE] src/components/audio/AudioRecorder.tsx — recorder dark con estados idle/recording/recorded
[DONE] src/components/product/ProductForm.tsx — formulario hi-fi, badge IA y tipado Zod/RHF compatible con build
[DONE] src/app/(auth)/product/[id]/page.tsx — detalle responsive con imagen optimizada, descripción y pipeline
[DONE] src/components/product/PipelineStatus.tsx — procesamiento y publicación solo en WhatsApp/Facebook/Mercado Libre
[DONE] verificación — 176 tests unitarios pasan y `next build` completa correctamente

## Pendiente

[PENDING] Dashboard — búsqueda, filtros por estado/canal, selección en lote y canales por fila requieren estado/acciones que no existen en la implementación actual.
[PENDING] Captura — preview textual en vivo y “Guardar borrador” requieren compartir estado del formulario y/o endpoint específico.
[PENDING] Detalle/edición — edición, SKU, reprocesar, cambiar foto, guardar cambios y publicar manualmente requieren campos/endpoints no disponibles.
[PENDING] Pipeline — reintento por job o por canal requiere endpoints/acciones nuevas; ecommerce permanece excluido de la UI por decisión de producto.
[DONE] Tests — Vitest excluye `e2e/`; los specs Playwright conservan su runner y dependencias independientes.

## Fix Deploy Vercel

> Completado: 2026-06-10

[DONE] tsconfig.json — excluye el subproyecto `e2e/` del type-check de Next/Vercel
[DONE] vitest.config.ts — excluye `e2e/` del discovery de Vitest; Playwright conserva su runner independiente
[DONE] src/app/login/page.tsx — logo migrado a `next/image`
[DONE] src/components/layout/Header.tsx — logos del shell migrados a `next/image`
[DONE] src/components/camera/CameraCapture.tsx — preview blob migrado a `next/image` con `unoptimized`
[DONE] src/components/camera/ImagePreview.tsx — preview blob migrado a `next/image` con `unoptimized`
[DONE] src/app/(auth)/product/new/page.tsx — preview de captura migrado a `next/image`
[DONE] src/app/(auth)/product/[id]/page.tsx — imagen dinámica del producto migrada a `next/image`
[DONE] src/components/product/ProductCard.tsx — thumbnail dinámico migrado a `next/image`
[DONE] src/test/setup.ts — mock de `next/image` para JSDOM sin alterar producción
[DONE] verificación deploy — 176 tests pasan; `next build` finaliza sin warnings `no-img-element` ni errores Playwright

### Deuda resuelta

[DONE] Tests — Vitest ya no recoge `e2e/**/*.spec.ts`; la suite E2E continúa aislada en `e2e/`.

## Branding — Favicon Impulso Ecommerce Admin

> Completado: 2026-06-10

[DONE] scripts/generate-icons.mjs — genera el isotipo Impulso Ecommerce Admin con antialiasing, favicon ICO multirresolución e iconos PWA sin dependencias externas
[DONE] src/app/favicon.ico — favicon Impulso Ecommerce Admin en tamaños 16x16, 32x32 y 48x48
[DONE] public/apple-touch-icon.png — icono Apple de 180x180
[DONE] public/icons/icon-192x192.png — icono PWA Impulso Ecommerce Admin
[DONE] public/icons/icon-512x512.png — icono PWA Impulso Ecommerce Admin
[DONE] public/manifest.json — theme/background alineados al canvas dark `#0A0A0B`
[DONE] src/app/layout.tsx — metadata explícita para favicon, shortcut y Apple touch icon
[DONE] src/test/manifest.test.ts — cobertura de existencia, referencias y firma PNG de los nuevos assets

## Auth — Refresh Token

> Completado: 2026-06-10

[DONE] src/lib/api.ts — refresh automático centralizado ante `401` y reintento único de la request original
[DONE] src/lib/api.ts — single-flight para compartir un solo refresh entre requests concurrentes
[DONE] src/lib/api.ts — persistencia del access token y refresh token rotados
[DONE] src/lib/api.ts — limpieza de localStorage/cookie y evento de sesión expirada cuando el refresh falla
[DONE] src/app/(auth)/layout.tsx — sincroniza token refrescado y redirige a `/login` al expirar la sesión
[DONE] src/types/auth.ts — contrato `RefreshResponse`
[DONE] src/lib/api.test.ts — cobertura de refresh, concurrencia, rotación, compatibilidad y sesión inválida
[DONE] src/app/(auth)/layout.test.tsx — cobertura de logout/redirección por sesión expirada
[DONE] verificación — 187 tests frontend pasan y `next build` finaliza correctamente
