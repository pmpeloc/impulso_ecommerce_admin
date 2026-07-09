'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { useTenantConfig } from '@/hooks/useTenantConfig'
import { ProductCard } from '@/components/product/ProductCard'
import { ExternalCatalogTable } from '@/components/product/ExternalCatalogTable'
import { BulkPriceAdjustModal } from '@/components/product/BulkPriceAdjustModal'
import { Button } from '@/components/ui/Button'

const PAGE_SIZE = 20

export default function DashboardPage() {
  const [page, setPage] = useState(1)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const { products, total, isLoading, error } = useProducts(page, PAGE_SIZE)
  const { tenantConfig } = useTenantConfig()

  // Mientras tenantConfig no llegó, se trata como 'own' — evita un segundo spinner
  // y preserva la vista actual (Renuevo/Antonello) sin parpadeo.
  const sourceMode = tenantConfig?.product_source_mode ?? 'own'

  // Memoizados sobre `products` (referencia estable entre renders no relacionados,
  // vía SWR) — un `.filter()` inline recrearía el array en cada render del padre
  // (ej: abrir el modal de ajuste de precios) y dispararía el resync de
  // ExternalCatalogTable, pisando ediciones ya confirmadas por el servidor.
  const externalProducts = useMemo(
    () => products.filter((p) => p.source === 'external'),
    [products],
  )
  const ownProducts = useMemo(
    () => products.filter((p) => p.source === 'own'),
    [products],
  )
  // En modo 'hybrid' la lista principal solo muestra productos propios — los
  // externos ya se muestran en la sección "Catálogo externo" más abajo.
  const mainListProducts = sourceMode === 'hybrid' ? ownProducts : products

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Cargando productos">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-brand" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-error">Error al cargar los productos</p>
      </div>
    )
  }

  // Modo 'external': el negocio no carga productos a mano — solo se muestra el
  // catálogo sincronizado del proveedor, sin acciones de alta manual.
  if (sourceMode === 'external') {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-[18px]">
        <div className="mb-4 flex justify-end">
          <Button variant="secondary" className="w-auto" onClick={() => setBulkModalOpen(true)}>
            Ajustar precios
          </Button>
        </div>
        <ExternalCatalogTable products={externalProducts} />
        <BulkPriceAdjustModal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-[18px]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B76]">Productos</p>
          <h1 className="mt-1 text-xl font-bold tracking-[-0.02em] md:text-2xl">Todos los productos</h1>
          <p className="mt-1 text-sm text-[#8A8A96]">{total} productos en el catálogo</p>
        </div>
        <Link
          href="/product/new"
          className="hidden items-center gap-2 rounded-lg bg-brand px-3.5 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-[#5457EE] md:flex"
        >
          <span aria-hidden="true">+</span> Agregar producto
        </Link>
      </div>

      <div className="mb-4 hidden flex-col gap-2.5 md:flex">
        <div className="flex gap-2.5">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border-strong bg-surface-input px-3 text-sm text-[#8A8A96]">
            <span aria-hidden="true">⌕</span> Buscar producto o ID…
          </div>
        </div>
        <div className="flex gap-2">
          <span className="rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-xs text-[#A1A1AC]">Estado</span>
          <span className="rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-xs text-[#A1A1AC]">Canal</span>
        </div>
      </div>

      {mainListProducts.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-5 py-16 text-center">
          <div className="grid h-[72px] w-[72px] place-items-center rounded-[20px] border border-dashed border-border-strong text-3xl text-[#8A8A96]">◇</div>
          <p className="mb-1 mt-4 text-lg font-semibold">Aún no hay productos</p>
          <p className="text-sm text-[#8A8A96]">Tocá “Nuevo producto” para agregar el primero</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-0 md:overflow-hidden md:rounded-xl md:border md:border-border md:bg-surface">
            <div className="hidden grid-cols-[minmax(220px,2fr)_110px_120px_110px_74px] items-center bg-surface-raised px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A8A96] md:grid">
              <span>Producto</span>
              <span>Precio</span>
              <span>Estado</span>
              <span>Canales</span>
              <span>Actualizado</span>
            </div>
            {mainListProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#A1A1AC] transition hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="font-mono text-xs text-[#8A8A96]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#A1A1AC] transition hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {sourceMode === 'hybrid' && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold tracking-[-0.02em]">Catálogo externo</h2>
            <Button variant="secondary" className="w-auto" onClick={() => setBulkModalOpen(true)}>
              Ajustar precios
            </Button>
          </div>
          <ExternalCatalogTable products={externalProducts} />
          <BulkPriceAdjustModal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
        </div>
      )}

      <Link
        href="/product/new"
        aria-label="Nuevo producto"
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-brand transition hover:bg-[#5457EE] md:hidden"
      >
        +
      </Link>
    </div>
  )
}
