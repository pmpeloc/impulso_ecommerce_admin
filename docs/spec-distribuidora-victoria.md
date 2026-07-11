# Spec — Admin de catálogo externo (Distribuidora Nehemías / fuente externa)

**Sprint:** Distribuidora Nehemías (fuente externa de productos)
**Fecha:** 2026-07-06
**Depende de:** `impulso_ecommerce_api` — spec/plan `distribuidora-victoria` (endpoints admin nuevos y
campos nuevos en `Product`/`TenantConfig`). Coordinarse: los endpoints deben existir antes de consumirlos.
**Estado:** Brainstorming cerrado con Misael

> **Nota de seguridad — refinamiento 2026-07-07:** la API sumó una comisión de venta interna de Red
> Impulso (`commission_pct`, `commission_mode`, `commission_basis` en `tenant_config`,
> `commission_pct_override` en `products`). **Ninguno de estos campos se declara en los tipos de este
> repo, ni se renderiza en ningún componente.** La API los excluye explícitamente de toda respuesta
> `/admin/*` (allowlist del lado del backend), así que esto no debería requerir ningún manejo especial
> acá — se documenta solo para que si en algún momento el JSON de `GET /admin/tenant-config` o `GET
> /admin/products` trae una clave `commission_*` por error, se trate como un bug de seguridad a reportar
> de inmediato, no como un campo más para mostrar en la UI. Sin endpoint ni UI de comisión en este
> sprint — se configura por BD hasta que exista `impulso_core_app`.

---

## Contexto

`impulso_ecommerce_admin` hoy asume un único flujo: alta manual de producto por foto + audio
(`ProductForm.tsx`), un precio único (`price`), y ninguna noción de "de dónde viene este producto".
Con Distribuidora Nehemías aparece un tenant cuyo catálogo entero viene sincronizado de un proveedor
externo (Distribuidora Victoria) — el dueño del negocio nunca da de alta un producto a mano, solo ajusta
precios y categorías sobre lo que ya llegó del sync diario.

**Importante — parametrización, no feature global:** esto NO debe verse en el admin de Renuevo
Almohadones ni de Antonello Muebles. Todo el UI nuevo de esta spec se activa/desactiva leyendo
`tenant_config.product_source_mode` (`'own'` | `'external'` | `'hybrid'`) — un campo que el dueño del
negocio **no controla** (se configura por Cowork/backend al dar de alta el tenant, ver spec de la API).
El admin nunca debe exponer un toggle para cambiar su propio `product_source_mode`.

## Decisiones ya cerradas (no volver a preguntar)

1. Vista de catálogo externo: tabla (no el formulario de captura actual), con columnas de precio origen
   (solo lectura) y precio propio (editable) para ambos niveles — retail y mayorista.
2. Editar un precio a mano lo bloquea automáticamente (`price_locked = true`) — el admin debe mostrar
   ese estado con un ícono/badge y permitir destrabarlo explícitamente.
3. Ajuste global de % (bulk) — un modal simple: elegir retail/mayorista/ambos, aplica sobre todos los
   productos no bloqueados del tenant.
4. Categorías de proveedor externo: editable inline (rename), el cambio propaga solo con guardar (el
   backend ya se encarga del `UPDATE` masivo).
5. `ProductForm.tsx` (captura foto+audio) sigue existiendo tal cual, pero solo se muestra si
   `product_source_mode` es `'own'` o `'hybrid'`.

## Diseño

### 1. Hook de tenant config (nuevo, falta por completo hoy)

`src/hooks/useTenantConfig.ts` — análogo a `useProducts.ts`, `GET /api/v1/admin/tenant-config` vía SWR.
Necesario porque hoy ningún componente del admin lee `tenant_config`. Este hook es la base para todo el
render condicional de esta spec (y reutilizable a futuro para mostrar branding, whatsapp, etc. en el
admin si hiciera falta).

```typescript
export function useTenantConfig() {
  const { data, error, isLoading } = useSWR('/api/v1/admin/tenant-config', fetcher)
  return { tenantConfig: data as TenantConfig | undefined, isLoading, error }
}
```

### 2. Tipos (`src/types/product.ts`, `src/types/tenant.ts` — nuevo)

Espejar (snake_case, per regla de excepción de contrato API del CLAUDE.md raíz) los campos nuevos de la
API: `source`, `external_source`, `external_id`, `external_category_id`, `source_price_retail`,
`source_price_wholesale`, `source_fx_rate`, `price_wholesale`, `price_locked`, `stock_mode` en
`Product`; `product_source_mode`, `markup_retail_pct`, `markup_wholesale_pct`, `checkout_methods` en un
`TenantConfig` nuevo (`src/types/tenant.ts` no existe todavía en este repo — crearlo).

### 3. Layout condicional (`src/app/(auth)/product/page.tsx` o donde viva la lista actual)

```
if (tenantConfig.product_source_mode === 'own')      → solo vista actual (cards + botón "nuevo producto")
if (tenantConfig.product_source_mode === 'external')  → solo ExternalCatalogTable, sin botón de alta manual
if (tenantConfig.product_source_mode === 'hybrid')    → ambas, con tabs o secciones separadas
```

### 4. `ExternalCatalogTable` (nuevo, `src/components/product/ExternalCatalogTable.tsx`)

Tabla con columnas: imagen, nombre, categoría (editable inline), SKU, stock (solo lectura si
`stock_mode: 'synced'`), precio origen retail/mayorista (solo lectura, gris/muted), precio propio
retail/mayorista (editable, input numérico), badge de "🔒 manual" cuando `price_locked`, botón
destrabar. Al editar un precio y perder foco/blur → `PATCH /admin/products/:id` con el valor nuevo
(auto-lockea del lado del backend, el frontend solo refleja el estado que vuelve).

### 5. `BulkPriceAdjustModal` (nuevo, `src/components/product/BulkPriceAdjustModal.tsx`)

Modal con select (retail / mayorista / ambos) + botón "Aplicar" → `POST
/admin/products/bulk-price-adjust`. Mostrar confirmación con cuántos productos se actualizaron (viene en
la respuesta) y aclarar en el copy que los productos bloqueados (🔒) no se tocan.

### 6. Edición inline de categoría

Dentro de `ExternalCatalogTable`, celda de categoría editable (click → input → blur guarda) →
`PATCH /admin/external-categories/:id { display_name }`. Revalidar la lista de productos vía SWR
`mutate` después de guardar (todos los productos de esa categoría cambian de texto).

### 7. `ProductForm.tsx` — sin cambios de lógica, solo gating

No modificar el formulario en sí. Solo el punto de entrada (la página que lo renderiza) queda detrás del
chequeo de `product_source_mode` de la sección 3.

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `src/types/tenant.ts` | CREAR |
| `src/types/product.ts` | MODIFICAR — campos nuevos |
| `src/hooks/useTenantConfig.ts` + `.test.ts` | CREAR |
| `src/hooks/useProducts.ts` | MODIFICAR si hace falta pasar filtro `source` |
| `src/components/product/ExternalCatalogTable.tsx` + `.test.tsx` | CREAR |
| `src/components/product/BulkPriceAdjustModal.tsx` + `.test.tsx` | CREAR |
| `src/components/product/PriceLockBadge.tsx` + `.test.tsx` | CREAR (componente chico, reutilizable) |
| `src/app/(auth)/product/page.tsx` (o el archivo real de la lista) | MODIFICAR — render condicional |
| `src/lib/api.ts` | posiblemente sin cambios (ya tiene `apiGet`/`apiPatch`/etc. genéricos — verificar) |

---

## Tests requeridos

- `useTenantConfig`: devuelve el config, maneja loading/error
- `ExternalCatalogTable`: renderiza precios origen como solo-lectura, precios propios como inputs,
  badge de lock visible cuando corresponde, dispara el PATCH correcto al editar
- `BulkPriceAdjustModal`: dispara el POST con el `priceType` correcto según selección
- Render condicional de la página de lista: `product_source_mode` own/external/hybrid muestran los
  componentes correctos (test de integración con mocks de `useTenantConfig`)

## Definición de Done

- [ ] `useTenantConfig` en verde y usado por la página de lista
- [ ] Vista `external` no muestra ningún botón de alta manual
- [ ] Vista `own` (Renuevo/Antonello) queda pixel-idéntica a como está hoy — test de regresión visual o
      al menos funcional explícito
- [ ] Ajuste global de % funcionando end-to-end contra la API (staging)
- [ ] Rename de categoría refleja en todos los productos tras `mutate`
- [ ] `src/types/tenant.ts` y `src/types/product.ts` de este repo **no** declaran ningún campo
      `commission_*` — confirmar contra la respuesta real de `GET /admin/tenant-config` en staging
- [ ] `docs/progress.md` actualizado
