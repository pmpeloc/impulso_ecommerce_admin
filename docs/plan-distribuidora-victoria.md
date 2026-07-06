# Impulso Ecommerce Admin — Plan de Tareas (Distribuidora Nahuel / fuente externa)

**Spec de referencia:** `docs/spec-distribuidora-victoria.md`
**Generado:** 2026-07-06
**Bloqueado por:** endpoints nuevos de `impulso_ecommerce_api` (ver su propio plan, Fase 7) deben estar
deployados antes de integrar de verdad — se puede avanzar en paralelo con mocks de API.

> TDD estricto: RED -> GREEN -> REFACTOR -> COMMIT en cada tarea.

---

## Fase 0 — Tipos y config

## [PENDING] types-tenant-nuevo
- Archivo: `src/types/tenant.ts`
- Test primero: N/A — solo tipos
- Implementación: crear `TenantConfig` (espejo snake_case de la API — ver spec de `impulso_ecommerce_api`
  sección "Tipos") incluyendo `product_source_mode`, `markup_retail_pct`, `markup_wholesale_pct`,
  `checkout_methods`
- Verificación: `npx tsc --noEmit` sin errores

## [PENDING] types-product-external-fields
- Archivo: `src/types/product.ts`
- Test primero: N/A — solo tipos
- Implementación: agregar `source`, `external_source`, `external_id`, `external_category_id`,
  `source_price_retail`, `source_price_wholesale`, `source_fx_rate`, `price_wholesale`, `price_locked`,
  `stock_mode` a `Product`
- Verificación: `npx tsc --noEmit` sin errores

## [PENDING] hook-use-tenant-config
- Archivo: `src/hooks/useTenantConfig.ts`
- Test primero: `useTenantConfig.test.ts` — devuelve `tenantConfig` cuando la API responde, `isLoading`
  mientras carga, `error` si falla el fetch (mismo patrón que `useProducts.test.ts`)
- Implementación: SWR sobre `GET /api/v1/admin/tenant-config`, reusar `apiGet` de `src/lib/api.ts`
- Verificación: tests en verde

---

## Fase 1 — Render condicional de la lista de productos

## [PENDING] product-list-gating
- Archivo: `src/app/(auth)/product/page.tsx` (confirmar path real del archivo antes de tocar)
- Test primero: test de integración — `product_source_mode: 'own'` renderiza solo la vista actual;
  `'external'` renderiza solo `ExternalCatalogTable` sin botón de alta; `'hybrid'` renderiza ambas
- Implementación: `useTenantConfig()` en la página, `if/else` sobre `product_source_mode` (ver spec
  sección "Diseño > 3")
- Verificación: tests en verde; navegar manualmente con un tenant mockeado en `'own'` y confirmar cero
  diferencias visuales vs. producción actual

---

## Fase 2 — Tabla de catálogo externo

## [PENDING] price-lock-badge
- Archivo: `src/components/product/PriceLockBadge.tsx`
- Test primero: `PriceLockBadge.test.tsx` — renderiza ícono/texto cuando `locked=true`, nada cuando
  `false`; dispara `onUnlock` al click cuando está bloqueado
- Implementación: componente chico y reutilizable
- Verificación: tests en verde

## [PENDING] external-catalog-table-render
- Archivo: `src/components/product/ExternalCatalogTable.tsx`
- Test primero: `ExternalCatalogTable.test.tsx` — renderiza filas con precio origen como texto (no
  input), precio propio como input editable, `PriceLockBadge` visible según `price_locked` de cada fila
- Implementación: tabla simple, columnas descriptas en la spec sección "Diseño > 4"
- Verificación: tests en verde

## [PENDING] external-catalog-table-edit-price
- Archivo: `src/components/product/ExternalCatalogTable.tsx`
- Test primero: editar el input de precio y blur → dispara `PATCH /admin/products/:id` con el valor
  nuevo; la fila refleja `price_locked: true` en la respuesta mockeada
- Implementación: `onBlur` handler, `apiPatch` (o el helper equivalente en `src/lib/api.ts` — confirmar
  nombre exacto)
- Verificación: tests en verde

## [PENDING] external-catalog-table-unlock
- Archivo: `src/components/product/ExternalCatalogTable.tsx`
- Test primero: click en `PriceLockBadge` de una fila bloqueada → `PATCH
  /admin/products/:id/price-lock { locked: false }`, no toca `price`
- Implementación: handler dedicado, no reusar el de edición de precio
- Verificación: tests en verde

## [PENDING] external-catalog-table-edit-category
- Archivo: `src/components/product/ExternalCatalogTable.tsx`
- Test primero: click en celda de categoría → input → blur → `PATCH
  /admin/external-categories/:id { display_name }`, luego `mutate` de la lista de productos
- Implementación: ver spec sección "Diseño > 6"
- Verificación: tests en verde

---

## Fase 3 — Ajuste global de precios

## [PENDING] bulk-price-adjust-modal
- Archivo: `src/components/product/BulkPriceAdjustModal.tsx`
- Test primero: `BulkPriceAdjustModal.test.tsx` — selección de retail/mayorista/ambos, click "Aplicar" →
  `POST /admin/products/bulk-price-adjust` con el `priceType` correcto; muestra el número de productos
  actualizados que devuelve la respuesta
- Implementación: modal simple con select + botón, ver spec sección "Diseño > 5"
- Verificación: tests en verde

## [PENDING] bulk-price-adjust-entry-point
- Archivo: `src/app/(auth)/product/page.tsx` (o donde se monte `ExternalCatalogTable`)
- Test primero: botón "Ajustar precios" visible solo en vista `external`/`hybrid`, abre el modal
- Implementación: wiring del botón + modal
- Verificación: tests en verde

---

## Fase 4 — Regresión

## [PENDING] regresion-own-tenants
- Archivo: N/A — suite de tests existente + smoke manual
- Test primero: correr toda la suite de tests del admin (`npm test`) y confirmar 0 regresiones
- Implementación: N/A
- Verificación: `npm test` en verde; smoke manual en un tenant `product_source_mode: 'own'` (o default si
  la migración de la API no lo setea explícito) sin diferencias visibles
