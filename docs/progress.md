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

## Sprint Distribuidora Nehemías — Admin de catálogo externo

> Completado (código): 2026-07-09 — pendiente: smoke manual en navegador antes de deployar
> Spec/Plan: `docs/spec-distribuidora-victoria.md`, `docs/plan-distribuidora-victoria.md`
> Depende de: endpoints admin de `impulso_ecommerce_api` (ya completos y aprobados en ese repo)
> Ejecutado con: superpowers subagent-driven-development, TDD estricto por tarea, code review por tarea + review final de todo el branch

### Fase 0 — Tipos y config
[DONE] types-tenant-nuevo — `src/types/tenant.ts` (nuevo), espejo exacto del allowlist admin de la API — **sin ningún campo `commission_*`**, verificado
[DONE] types-product-external-fields — 10 campos nuevos en `Product` (`src/types/product.ts`)
[DONE] hook-use-tenant-config — `src/hooks/useTenantConfig.ts`, corrige un error del spec original (la respuesta viene envuelta en `{ tenantConfig }`, no cruda)

### Fase 2 — Tabla de catálogo externo (ejecutada antes que Fase 1 — ver nota de orden abajo)
[DONE] price-lock-badge — `src/components/product/PriceLockBadge.tsx`
[DONE] external-catalog-table-render — `src/components/product/ExternalCatalogTable.tsx` (solo render). Agregó `category`/`sku`/`stock` a `Product` (aditivo, no estaban en el tipo)
[DONE] external-catalog-table-edit-price — wiring de `PATCH /admin/products/:id`. Agregó `apiPatch` a `src/lib/api.ts` (no existía, el plan asumía que sí). Un fix de revisión: inputs pasaron de no controlados a controlados para reflejar precios normalizados por el servidor
[DONE] external-catalog-table-unlock — wiring de `PATCH /admin/products/:id/price-lock`
[DONE] external-catalog-table-edit-category — wiring de `PATCH /admin/external-categories/:id`, con propagación a todas las filas que comparten `external_category_id` (no solo la editada)

### Fase 1 — Render condicional de la lista
[DONE] product-list-gating — `src/app/(auth)/dashboard/page.tsx` (era el archivo real de la lista, no `product/page.tsx` como decía el plan). Modo `'own'` verificado byte-a-byte idéntico al comportamiento anterior; `'external'` oculta alta manual; `'hybrid'` muestra ambas

### Fase 3 — Ajuste global de precios
[DONE] bulk-price-adjust-modal — `src/components/product/BulkPriceAdjustModal.tsx`, sin componente `Modal` genérico nuevo (YAGNI, un solo caso de uso)
[DONE] bulk-price-adjust-entry-point — botón "Ajustar precios" en `dashboard/page.tsx`, visible solo en `external`/`hybrid`

### Fase 4 — Regresión
[DONE] regresion-own-tenants — verificado automatizado: 228/228 tests en verde, `tsc --noEmit` con los mismos 4 errores preexistentes sin relación (documentados, sin cambios durante todo el sprint). **Pendiente:** smoke manual en navegador — no había herramienta de automatización de browser disponible en esta sesión. Riesgo bajo (el JSX del modo `'own'` quedó verificado idéntico byte a byte en cada tarea que tocó ese archivo), pero falta la confirmación visual antes de deployar.

### Correcciones de premisa hechas durante la ejecución
- El plan asumía `src/app/(auth)/product/page.tsx` como la lista de productos — el archivo real es `dashboard/page.tsx`.
- El plan asumía que `src/lib/api.ts` ya tenía `apiPatch` — no existía, se agregó.
- El orden de ejecución de Fase 1 y Fase 2 se invirtió: `ExternalCatalogTable` se construyó antes que el gating de la página, porque el gating necesita importar el componente real (evita un stub descartable).
- Limitación aceptada y documentada (no resuelta en este sprint): después de un ajuste masivo de precios, la tabla no se refresca sola con los precios nuevos — el modal ya muestra la confirmación con el número real de productos actualizados, pero hace falta recargar la página para ver los precios nuevos en la tabla. `useProducts()` no expone `mutate` hoy.

### Pendiente antes de habilitar esto en producción
- Smoke manual en navegador con un tenant `'own'` (Renuevo/Antonello) y otro `'external'` — confirmar cero diferencias visuales en el primero y funcionamiento end-to-end en el segundo.
- Todo lo pendiente del lado de `impulso_ecommerce_api` (migrations sin aplicar contra Supabase real, `SYNC_SECRET`, markup/comisión de Distribuidora Nehemías, cron de 30 min, dominio y WhatsApp real) — ver `impulso_ecommerce_api/docs/progress.md`, sección "Sprint Distribuidora Nehemías".

## Pantalla de Configuración (Settings) — pendiente, detectado 2026-07-15

`useTenantConfig.ts` existe pero solo se usa para gating interno (`product_source_mode` en el dashboard)
— nunca se construyó una pantalla para que el dueño del negocio edite su propio `tenant_config` (branding,
WhatsApp, checkout methods, nav sections, theme), a pesar de que `GET/PUT /admin/tenant-config` ya existe
en `impulso_ecommerce_api` desde el Sprint 3 del refactor multi-tenant.

Bug relacionado encontrado en `impulso_ecommerce_api/src/utils/admin-views.ts`: `TENANT_CONFIG_ADMIN_FIELDS`
no incluye `nav_sections`, `tagline`, `city`, `default_product_image_url`, `theme_id` — campos agregados
en la migration 013 (Sprint Distribuidora Nehemías, sección "Fase 0" de este mismo repo asumía que sí
estaban). El endpoint `PUT /admin/tenant-config` los acepta a nivel de tabla pero el `GET` nunca los
devuelve al dueño del negocio ni la respuesta del `PUT` los refleja — hay que corregir el allowlist antes
o junto con la pantalla nueva, si no la edición de esos campos queda invisible para quien la use.

No es parte de ningún sprint activo — queda como deuda documentada hasta que se priorice.
