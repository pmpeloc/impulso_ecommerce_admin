# Agente QA — Impulso Ecommerce Admin (Prompt para Cowork)

**Propósito:** Testear Impulso Ecommerce Admin de punta a punta como un QA humano, usando Claude in Chrome.
**Cómo usar:** Pegá este prompt en un chat nuevo de Cowork cuando quieras correr una sesión de QA.

---

## Prompt del Agente QA

```
Vas a actuar como un QA engineer y vas a testear la aplicación Impulso Ecommerce Admin de punta a punta.
Usá las herramientas de Claude in Chrome para navegar e interactuar con la app.

URL de la app: {URL_DE_IMPULSO_ECOMMERCE_ADMIN}   ← reemplazar con la URL real (local o producción)

---

### Casos de prueba a ejecutar

Ejecutá cada caso en orden. Para cada uno registrá: ✅ PASA, ❌ FALLA (con descripción del error), o ⚠️ PARCIAL.

---

#### TC-01: Login
1. Navegar a la URL de la app
2. Verificar que se muestra el formulario de login
3. Ingresar email y contraseña de prueba: {TEST_EMAIL} / {TEST_PASSWORD}
4. Hacer click en "Iniciar sesión"
5. Verificar que redirige al dashboard y se muestra el nombre del tenant

Resultado esperado: login exitoso, dashboard visible con lista de productos

---

#### TC-02: Crear producto con imagen y texto manual
1. Hacer click en el botón de agregar producto (o equivalente)
2. Completar: nombre "Sillón Roma Test", precio "45000", descripción manual "Sillón de madera maciza tapizado en tela"
3. Subir una imagen de prueba (cualquier imagen disponible)
4. NO subir audio
5. Confirmar/guardar el producto
6. Verificar que aparece en la lista con status "draft" o "processing"

Resultado esperado: producto creado, pipeline de ingestion disparado en background

---

#### TC-03: Verificar pipeline de ingestion
1. Abrir el detalle del producto creado en TC-02
2. Navegar a la sección de pipeline o estado
3. Esperar hasta 30 segundos, refrescando si hace falta
4. Verificar que los jobs de ingestion aparecen como "done"
5. Verificar que `image_optimized_url` tiene valor (imagen comprimida guardada)
6. Verificar que el status del producto cambió a "processing" o "published"

Resultado esperado: pipeline completado, imagen optimizada disponible

---

#### TC-04: Crear producto con audio
1. Crear un nuevo producto: nombre "Mesa de Centro Test", precio "28000"
2. Subir imagen de prueba
3. Subir un archivo de audio de prueba (cualquier .mp3 o .wav de menos de 1 minuto)
4. Confirmar/guardar
5. Esperar hasta 60 segundos y verificar que la descripción fue transcripta por Whisper
6. Verificar que `description_transcription` tiene texto (no vacío)

Resultado esperado: descripción generada automáticamente desde el audio

---

#### TC-05: Verificar publish logs
1. En el producto del TC-02 o TC-04 (cuando status = "published")
2. Revisar la sección de publicaciones / publish logs
3. Verificar que hay un log para el canal "whatsapp" con status "success" o "failed"
4. Verificar que hay un log para el canal "facebook"
5. Verificar que hay un log para el canal "mercadolibre"

Resultado esperado: logs visibles para los 3 canales (pueden ser stub o reales según config)

---

#### TC-06: Verificar endpoint público de impulso_ecommerce_app
1. Abrir una nueva pestaña
2. Navegar a: {URL_DE_IMPULSO_ECOMMERCE_API}/api/v1/public/products?tenantSlug={TENANT_SLUG}
3. Verificar que la respuesta JSON incluye los productos publicados del TC-02 y TC-04
4. Verificar que cada producto tiene: id, name, price, image_url, status="published"

Resultado esperado: productos visibles en la API pública de impulso_ecommerce_app

---

#### TC-07: Verificar multi-tenant (si hay más de 1 tenant)
1. Navegar a: {URL_DE_IMPULSO_ECOMMERCE_API}/api/v1/public/products?tenantSlug={OTRO_TENANT_SLUG}
2. Verificar que NO aparecen los productos del tenant del TC-02
3. Verificar que el RLS está funcionando correctamente

Resultado esperado: aislamiento de datos entre tenants

---

### Reporte final

Al terminar todos los casos, generá un reporte en este formato:

```markdown
# Reporte QA — Impulso Ecommerce Admin
**Fecha:** {fecha}
**Entorno:** {local/producción}
**URL:** {URL_DE_IMPULSO_ECOMMERCE_ADMIN}

## Resumen
| Total | ✅ Pasan | ❌ Fallan | ⚠️ Parciales |
|-------|---------|----------|--------------|
| 7     | X       | X        | X            |

## Detalle

| ID    | Nombre | Estado | Observaciones |
|-------|--------|--------|---------------|
| TC-01 | Login  | ✅     |               |
| TC-02 | ...    | ...    | ...           |
...

## Issues encontrados (solo si hay fallas)
- **[TC-XX]** Descripción del problema, URL afectada, pasos para reproducir

## Próximos pasos recomendados
...
```

Guardá el reporte como `qa-report-{fecha}.md`.
```

---

## Variables a configurar antes de correr el agente

| Variable | Valor |
|----------|-------|
| `{URL_DE_IMPULSO_ECOMMERCE_ADMIN}` | URL de la PWA (ej: http://localhost:3000 o https://admin.red-impulso.com) |
| `{URL_DE_IMPULSO_ECOMMERCE_API}` | URL de la API (ej: http://localhost:3001 o https://impulso-ecommerce-api.up.railway.app) |
| `{TEST_EMAIL}` | Email del usuario de prueba |
| `{TEST_PASSWORD}` | Contraseña del usuario de prueba |
| `{TENANT_SLUG}` | Slug del tenant a testear (ej: renuevo) |
| `{OTRO_TENANT_SLUG}` | Slug de un segundo tenant (solo para TC-07, opcional) |

---

## Cuándo correr el agente QA

- Antes de un deploy a producción
- Después de implementar un sprint nuevo
- Cuando un cliente reporta un problema
- Como smoke test semanal (puede schedularse como tarea automática en Cowork)

## Extensiones futuras

- Agregar TC-08: verificar que el background removal genera `image_bg_removed_url` (cuando el Sprint C esté deployado)
- Agregar TC-09: verificar que los publish logs de WhatsApp tienen `external_id` real de Meta (cuando el Sprint A esté en producción con credenciales)
- Agregar TC-10: verificar el endpoint GET /admin/insights retorna datos de Instagram
