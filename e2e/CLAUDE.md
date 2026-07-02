# Impulso Ecommerce Admin E2E — Test Suite

> Leer también: `../CLAUDE.md` (impulso_ecommerce_admin) y `../../CLAUDE.md` (raíz) para contexto global del proyecto.

## Propósito

Suite de tests end-to-end que prueba el sistema completo como caja negra: la PWA (`impulso_ecommerce_admin`) consumiendo la API real (`impulso_ecommerce_api`). Cubre regresión, flujos críticos y aislamiento multi-tenant.

**Scope actual:** ejecución local únicamente. CI/CD se integrará en un sprint futuro.

---

## Stack

| Tecnología | Uso |
|-----------|-----|
| Playwright | Browser automation + assertions |
| TypeScript | Tipado completo |
| @supabase/supabase-js | Cleanup directo de datos de test vía Service Key |

---

## Estructura de Carpetas

```
e2e/
├── fixtures/
│   ├── test-image.jpg          # Imagen fija pequeña para tests (< 200KB)
│   └── test-audio.wav          # Tono WAV 5s para tests de Whisper (@paid) — Whisper puede retornar [Music] o vacío, lo que importa es que el pipeline complete
│
├── helpers/
│   ├── auth.ts                 # Login helper — obtiene token y setea cookies
│   ├── db-cleanup.ts           # Limpieza de datos del tenant de test en Supabase
│   └── api.ts                  # Cliente HTTP directo para setup/teardown vía API
│
├── tests/
│   ├── auth/
│   │   └── login.spec.ts       # Login exitoso, credenciales inválidas, body inválido
│   ├── products/
│   │   ├── create.spec.ts      # Crear producto con imagen, sin imagen (400), con audio (@paid)
│   │   ├── list.spec.ts        # Listar productos, paginación, estado vacío
│   │   └── pipeline.spec.ts    # Pipeline status, polling, estados terminales
│   └── full-flow/
│       └── manufacturer.spec.ts  # Flujo completo de punta a punta (@full)
│
├── docs/
│   ├── plan.md                 # Plan generado por Superpowers
│   └── progress.md             # Estado de tareas
│
├── .env.test                   # Variables de entorno para tests (gitignored)
├── .env.test.example           # Template con claves vacías (commiteado)
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## Estrategia de Datos de Test

### Tenant de test dedicado
Todos los tests corren contra un tenant exclusivo (`slug: 'test-tenant'`). Los datos de producción nunca se tocan.

### Limpieza automática
Cada suite ejecuta cleanup en `afterAll` usando la Service Key de Supabase directamente:
```typescript
// helpers/db-cleanup.ts
export async function cleanupTestProducts(tenantId: string) {
  await supabaseAdmin
    .from('products')
    .delete()
    .eq('tenant_id', tenantId)
}
```

El tenant de test en sí **no se borra** entre runs — solo sus productos y publish_logs. El tenant se crea una sola vez manualmente (igual que el proceso de onboarding documentado en `impulso_ecommerce_api/CLAUDE.md`).

---

## Etiquetas de Tests

Los tests se agrupan con etiquetas en el nombre para poder correr subconjuntos:

| Tag | Descripción | Comando |
|-----|-------------|---------|
| `@smoke` | Tests críticos rápidos (~2 min) | `npx playwright test --grep @smoke` |
| `@full` | Flujo completo de punta a punta | `npx playwright test --grep @full` |
| `@paid` | Llaman servicios con costo (Whisper) | `npx playwright test --grep @paid` |
| _(sin tag)_ | Todos excepto `@paid` | `npx playwright test --grep-invert @paid` |

**Regla para `@paid`:** estos tests usan `fixtures/test-audio.wav` (tono WAV de 5 segundos). Costo por ejecución: ~USD $0.0003. No corren por defecto — activar explícitamente cuando se quiera verificar Whisper. El test verifica que el pipeline complete, no el contenido de la transcripción.

---

## Cobertura de Tests

### `auth/login.spec.ts`
- ✅ `@smoke` Login exitoso → token guardado, redirect a dashboard
- ✅ `@smoke` Credenciales inválidas → 401
- ✅ Body inválido (sin password) → 400
- ✅ Request a ruta protegida sin sesión → redirect a /login

### `products/create.spec.ts`
- ✅ `@smoke` Crear producto con imagen → status 'draft', pipeline inicia
- ✅ Crear sin imagen → error visible en UI
- ✅ `@paid` Crear con audio → descripción transcripta por Whisper aparece en el producto
- ✅ Precio inválido (negativo) → validación en formulario

### `products/list.spec.ts`
- ✅ `@smoke` Lista de productos visible después de crear uno
- ✅ Estado vacío cuando no hay productos
- ✅ Badge de status correcto por estado (draft/processing/published/failed)

### `products/pipeline.spec.ts`
- ✅ `@smoke` Pipeline status accesible vía GET /products/:id/pipeline
- ✅ Polling se detiene cuando producto es published o failed
- ✅ Publish logs visibles por canal

### `full-flow/manufacturer.spec.ts` — `@full`
Flujo completo de punta a punta:
1. Login como fabricante
2. Dashboard muestra lista (o estado vacío)
3. Crear nuevo producto → capturar foto (fixture) → completar formulario
4. Redirect a página de detalle → pipeline en estado 'draft'
5. Polling hasta estado terminal (published con stubs)
6. Producto aparece en dashboard con badge 'published'
7. Cleanup de datos creados

### Seguridad y aislamiento
- ✅ Cross-tenant: producto de otro tenant retorna 404
- ✅ Rate limiting: 101 requests seguidos → 429

---

## Variables de Entorno

```bash
# .env.test.example
PLAYWRIGHT_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001/api/v1

# Credenciales del usuario de test (tenant: test-tenant, role: admin)
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
TEST_TENANT_ID=

# Supabase — para cleanup directo de datos de test
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

> ⚠️ `SUPABASE_SERVICE_KEY` solo para uso local en tests. Nunca en producción ni en CI/CD sin secrets management.

---

## Comandos

```bash
# Instalar dependencias
npm install

# Correr todos los tests (excepto @paid)
npx playwright test --grep-invert @paid

# Correr solo smoke tests (rápido, ~2 min)
npx playwright test --grep @smoke

# Correr flujo completo
npx playwright test --grep @full

# Correr tests de Whisper (tiene costo mínimo)
npx playwright test --grep @paid

# Correr TODOS los tests incluyendo @paid
npx playwright test

# Ver reporte HTML después de correr
npx playwright show-report

# Modo UI interactivo (debug)
npx playwright test --ui
```

---

## Setup Inicial (una sola vez)

Antes de correr los tests por primera vez:

1. Asegurarse de que `impulso_ecommerce_api` y `impulso_ecommerce_admin` están corriendo localmente
2. Crear el tenant de test en Supabase (ver proceso en `impulso_ecommerce_api/CLAUDE.md` — deuda técnica #1)
3. Crear un usuario de test en Supabase Auth y vincularlo al tenant de test
4. Copiar `.env.test.example` → `.env.test` y completar las variables
5. Descargar/crear los fixtures de audio e imagen en `fixtures/`

---

## Instrucciones para Superpowers

Al iniciar trabajo en este repo:
1. Leer este `CLAUDE.md` y `../CLAUDE.md` antes de cualquier acción
2. Al finalizar brainstorming → guardar spec en `docs/spec.md`
3. Al generar plan → guardar en `docs/plan.md`
4. Al completar cada tarea → actualizar `docs/progress.md`
5. TDD no aplica igual acá — los tests son el producto. Verificar que cada spec corre (`npx playwright test archivo.spec.ts`) antes de marcar DONE
6. Nunca hardcodear credenciales — siempre desde `.env.test`
7. Cada spec debe ser independiente — no depender de orden de ejecución
8. Siempre implementar cleanup en `afterAll` para no acumular datos de test
