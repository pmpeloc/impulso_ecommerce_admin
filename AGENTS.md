# AGENTS.md — Prodcast App (contexto para Codex)

> Este archivo es el equivalente a `CLAUDE.md` (usado por Claude) pero para agentes Codex/OpenAI. Resume lo esencial del proyecto para aplicar el rediseño visual generado en Claude Design sin romper la lógica existente.

## Qué es Prodcast

PWA (Next.js 14 App Router + TypeScript strict + Tailwind) para que el equipo de Red Impulso capture productos: foto, nombre, descripción (audio→texto), precio. El sistema procesa con AI y publica en múltiples canales (WhatsApp, Facebook, Mercado Libre, ecommerce propio).

## Stack (no cambiar versiones)

- Next.js 14+ App Router
- TypeScript strict — sin `any`
- Tailwind CSS 3+ — único sistema de estilos, mobile-first
- Zustand ^5.0.14 (API v5, sin `set` wrapper en `create`)
- React Hook Form + @hookform/resolvers ^5.4.0 + Zod 4.x
- SWR para fetching/cache
- Vitest + @testing-library/react para tests

## Estructura relevante

```
src/
├── app/
│   ├── (auth)/layout.tsx        # pb-20 obligatorio (BottomNav fixed)
│   ├── (auth)/dashboard/page.tsx
│   ├── (auth)/product/new/page.tsx
│   ├── (auth)/product/[id]/page.tsx
│   ├── login/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/Button.tsx, Input.tsx
│   ├── camera/CameraCapture.tsx, ImagePreview.tsx
│   ├── audio/AudioRecorder.tsx
│   ├── product/ProductForm.tsx, ProductCard.tsx, PipelineStatus.tsx
│   └── layout/Header.tsx, BottomNav.tsx
├── hooks/                        # useCamera, useAudioRecorder, useProducts, useProduct, usePipeline, useAuth
├── lib/api.ts, auth.ts
├── types/product.ts, api.ts, auth.ts
└── middleware.ts
```

## REGLA PRINCIPAL: Rediseño visual únicamente

El objetivo es aplicar el nuevo diseño (Claude Design hi-fi handoff, prompt + zip adjuntos) a los componentes existentes. **No tocar:**

- Lógica de negocio, hooks, stores, llamadas a `lib/api.ts`
- Tipos en `src/types/` (snake_case en `Product`, `PipelineJob`, `PublishLog`, etc. — ver detalle abajo)
- Polling de `useProduct` y `usePipeline`
- Autenticación (cookie + Zustand + middleware) — triple capa, no simplificar
- Tests existentes — deben seguir pasando (`npm test`)

**Sí cambiar:** estructura visual de componentes (JSX/markup), clases Tailwind, paleta de colores, tipografía, spacing, animaciones, layout responsive.

## Design System aplicado (Claude Design)

Dark-mode first, inspirado en Vercel Dashboard:

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

**Fix obligatorio:** el login actual tiene texto blanco sobre fondo blanco en los inputs (ilegible). Verificar que todos los inputs tengan contraste correcto con el nuevo tema oscuro.

## Tipos — no modificar la forma, solo el render

### `Product` (snake_case, viene de Supabase sin transformar)
```typescript
type ProductStatus = 'draft' | 'processing' | 'published' | 'failed'
interface Product {
  id: string
  tenant_id: string
  name: string
  description_transcription: string | null
  description_optimized: string | null
  price: number
  status: ProductStatus
  image_url: string | null
  image_optimized_url: string | null
  image_ai_url: string | null
  audio_url: string | null
  created_at: string
  updated_at: string
}
```
UI: mostrar `description_optimized ?? description_transcription`, nunca `null`.

### `PipelineStatusResponse` (excepción camelCase: `publishLogs`)
```typescript
type PublishChannel = 'whatsapp' | 'facebook' | 'mercadolibre' | 'ecommerce'
interface PipelineStatusResponse {
  jobs: PipelineJob[]
  publishLogs: PublishLog[]
}
```
`PipelineStatus` (componente) solo muestra canales `['whatsapp', 'facebook', 'mercadolibre']` — `ecommerce` queda excluido intencionalmente, no agregarlo en el rediseño.

## Convenciones de código

- Functional components, un componente por archivo (PascalCase)
- Props tipadas con `interface`, justo arriba del componente
- Sin lógica de negocio en componentes — usar hooks existentes
- Clases Tailwind ordenadas: layout → spacing → typography → colors → states
- Loading states explícitos en operaciones async (mantener los existentes, solo restylear)
- `BottomNav` es `fixed bottom-0` — todo `<main>` en `(auth)/` debe conservar `pb-20`

## Al finalizar

1. Correr `npm test` y `npm run build` — deben pasar sin errores
2. Actualizar `docs/progress.md`: agregar sección "Rediseño Hi-Fi (Claude Design)" con `[DONE]` por cada componente modificado
3. Si algo del diseño requiere un componente/feature que no existe en la API (ej. nuevos campos), documentarlo como deuda técnica en `docs/progress.md` bajo "Pendiente" — no inventar datos ni endpoints

## Estado actual — Rediseño Hi-Fi

**Implementado 2026-06-10:** tema dark + indigo, login, shell responsive (sidebar desktop + header/bottom nav mobile), dashboard tabla/cards, captura y formulario, audio recorder, detalle y pipeline multicanal. El rediseño mantiene hooks, auth, polling, API y tipos existentes.

**Verificación:** 176 tests unitarios pasan y `next build` finaliza correctamente. Vitest excluye `e2e/`; los specs E2E se ejecutan con Playwright desde su subproyecto.

**Deuda funcional del handoff:** búsqueda/filtros/acciones en lote, preview textual en vivo, guardado de borrador, edición/SKU/reprocesamiento y reintentos por canal requieren lógica o endpoints nuevos. Ver `docs/progress.md`.

## Estado actual — Deploy Vercel

**Fix implementado 2026-06-10:** Next/Vercel excluye `e2e/` del type-check y Vitest excluye los specs Playwright de su discovery. Todas las imágenes del rediseño usan `next/image`; previews blob y URLs dinámicas usan `unoptimized` para no depender de dominios remotos configurados.

**Verificación vigente:** 176 tests unitarios pasan y `next build` finaliza sin warnings `@next/next/no-img-element` ni errores por `@playwright/test`.

## Estado actual — Branding PWA

**Implementado 2026-06-10:** favicon multirresolución e iconos PWA/Apple derivados del isotipo oficial Prodcast (indigo + “P” blanca + punto violeta). `scripts/generate-icons.mjs` permite regenerarlos sin dependencias externas.
