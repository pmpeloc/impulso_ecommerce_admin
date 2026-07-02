# Prompt para Codex — Aplicar rediseño Hi-Fi de Impulso Ecommerce Admin (Claude Design)

## Cómo usar este prompt

1. Abrí Codex en el repo `impulso_ecommerce_admin/`
2. Asegurate de que `AGENTS.md` (raíz del repo) esté presente — Codex lo lee automáticamente como contexto
3. Adjuntá el zip descargado del handoff de Claude Design
4. Pegá el prompt de abajo, seguido del prompt de "Handoff to Claude Code" que generó Claude Design (pegalo a continuación, sin modificar)

---

## Prompt

Leé `AGENTS.md` en la raíz de este repo antes de hacer cualquier cambio — contiene las reglas del proyecto, el design system a aplicar, y qué partes del código NO se pueden modificar.

Tu tarea es aplicar el rediseño visual hi-fi generado en Claude Design (adjunto: zip + prompt de handoff que sigue a continuación) a los componentes existentes de `impulso_ecommerce_admin/src/`.

Reglas clave (ya detalladas en `AGENTS.md`, resumidas acá):

1. **Solo cambios visuales**: markup JSX, clases Tailwind, paleta de colores, tipografía, spacing, animaciones, layouts responsive. No tocar hooks, stores, llamadas a API, tipos, autenticación, ni polling.
2. **Design system**: dark-mode, primary `#6366F1`, background `#0A0A0B`, surface `#111113`, border `#1F1F23`, texto `#FAFAFA`/`#A1A1AA`, success/warning/error/AI según tokens en `AGENTS.md`. Inter para UI, JetBrains Mono para IDs/SKUs. Border radius 8px.
3. **Fix obligatorio**: el login actual tiene inputs con texto invisible (blanco sobre blanco). Asegurate de que el nuevo tema resuelva esto con contraste correcto.
4. **Pantallas a aplicar**: login, dashboard (lista de productos + status), captura de producto nuevo (cámara + audio + form), detalle/edición de producto, pipeline status / publicación multicanal.
5. **Mantené `pb-20` en `<main>` de `(auth)/layout.tsx`** — `BottomNav` es `fixed bottom-0`.
6. **Tipos**: no modifiques `src/types/`. Si el diseño muestra datos que no existen en `Product`, `PipelineJob` o `PublishLog`, usá los campos existentes o documentá la diferencia como deuda técnica — no inventes campos nuevos en el render sin chequear el tipo.
7. **`PipelineStatus`**: solo mostrar canales `whatsapp`, `facebook`, `mercadolibre` (no `ecommerce`) — ya documentado como decisión de producto.

Al finalizar:
- Corré `npm test` y `npm run build`, deben pasar sin errores
- Actualizá `impulso_ecommerce_admin/docs/progress.md` agregando una sección "Rediseño Hi-Fi (Claude Design)" con `[DONE] componente — descripción del cambio` por cada archivo modificado
- Si encontrás features del diseño que requieren cambios de API/datos no disponibles, listalos en `docs/progress.md` bajo "Pendiente" como deuda técnica, sin implementarlos

---

[PEGAR ACÁ EL PROMPT DE "HANDOFF TO CLAUDE CODE" GENERADO POR CLAUDE DESIGN]
