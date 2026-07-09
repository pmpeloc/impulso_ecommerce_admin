import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { PriceLockBadge } from '@/components/product/PriceLockBadge'
import { apiPatch } from '@/lib/api'

interface ExternalCatalogTableProps {
  products: Product[]
}

function formatOriginPrice(value: number | null): string {
  return value === null ? '—' : String(value)
}

// Estilo consistente con `Input.tsx` pero sin el wrapper de `<label>` —
// acá el input vive dentro de una celda de tabla densa.
const OWN_PRICE_INPUT_CLASSES =
  'w-24 rounded-lg border border-border-strong bg-surface-input px-2.5 py-1.5 text-sm text-[#EDEDF0] outline-none transition duration-150 focus:border-brand focus:ring-2 focus:ring-indigo-500/20'

type PriceField = 'price' | 'price_wholesale'

export function ExternalCatalogTable({ products }: ExternalCatalogTableProps) {
  const [rows, setRows] = useState<Product[]>(products)
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({})
  // Texto que el usuario está tipeando ahora mismo, separado del valor confirmado
  // por el servidor que vive en `rows`. Mientras haya una entrada acá, el input
  // muestra este valor; al confirmar (éxito o error) se limpia y el input vuelve
  // a reflejar `rows`, que es la única fuente de verdad server-confirmed.
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({})

  // Resincroniza si el padre re-fetchea/pagina y cambia la referencia de `products`,
  // para no dejar la tabla mostrando datos viejos.
  useEffect(() => {
    setRows(products)
    setDraftPrices({})
  }, [products])

  function handlePriceChange(
    id: string,
    field: PriceField,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const key = `${id}-${field}`
    setDraftPrices((current) => ({ ...current, [key]: event.target.value }))
  }

  function clearDraft(key: string) {
    setDraftPrices((current) => {
      if (!(key in current)) return current
      const rest = { ...current }
      delete rest[key]
      return rest
    })
  }

  async function handlePriceBlur(
    row: Product,
    field: PriceField,
    event: React.FocusEvent<HTMLInputElement>,
  ) {
    // `row` viene de `rows` (estado confirmado por el servidor), nunca se
    // muta por tipeo — es la base correcta para la comparación de "sin cambios".
    const previousValue = field === 'price' ? row.price : row.price_wholesale
    const rawValue = event.target.value
    const newValue = rawValue === '' ? null : Number(rawValue)
    const errorKey = `${row.id}-${field}`

    if (newValue === previousValue) {
      clearDraft(errorKey)
      return
    }

    try {
      const { product } = await apiPatch<{ product: Product }>(
        `/api/v1/admin/products/${row.id}`,
        { [field]: newValue },
      )

      setRows((current) => current.map((r) => (r.id === row.id ? product : r)))
      clearDraft(errorKey)
      setPriceErrors((current) => {
        if (!(errorKey in current)) return current
        const rest = { ...current }
        delete rest[errorKey]
        return rest
      })
    } catch {
      // Revertir el input al valor anterior — el PATCH no se guardó. Al limpiar
      // el draft, el input controlado vuelve a mostrar `row` (que no se tocó).
      clearDraft(errorKey)
      setPriceErrors((current) => ({
        ...current,
        [errorKey]: 'No se pudo guardar el precio. Intentá de nuevo.',
      }))
    }
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-border text-xs font-medium text-[#8A8A96]">
          <th scope="col" className="px-3 py-2">Imagen</th>
          <th scope="col" className="px-3 py-2">Nombre</th>
          <th scope="col" className="px-3 py-2">Categoría</th>
          <th scope="col" className="px-3 py-2">SKU</th>
          <th scope="col" className="px-3 py-2">Stock</th>
          <th scope="col" className="px-3 py-2">Precio origen retail</th>
          <th scope="col" className="px-3 py-2">Precio origen mayorista</th>
          <th scope="col" className="px-3 py-2">Precio propio retail</th>
          <th scope="col" className="px-3 py-2">Precio propio mayorista</th>
          <th scope="col" className="px-3 py-2">Lock</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((product) => {
          const imgSrc = product.image_optimized_url ?? product.image_url
          const retailError = priceErrors[`${product.id}-price`]
          const wholesaleError = priceErrors[`${product.id}-price_wholesale`]

          return (
            <tr key={product.id} className="border-b border-border">
              <td className="px-3 py-2">
                {imgSrc ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image
                      src={imgSrc}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-[#30283C] text-[#8A8A96]">
                    <span className="text-lg" aria-hidden="true">◇</span>
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-sm font-semibold text-[#EDEDF0]">{product.name}</td>
              <td className="px-3 py-2 text-sm text-[#A1A1AC]">{product.category ?? product.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-[#A1A1AC]">{product.sku ?? '—'}</td>
              <td className="px-3 py-2 text-sm text-[#A1A1AC]">{product.stock}</td>
              <td className="px-3 py-2 text-sm text-[#6B6B76]">{formatOriginPrice(product.source_price_retail)}</td>
              <td className="px-3 py-2 text-sm text-[#6B6B76]">{formatOriginPrice(product.source_price_wholesale)}</td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={draftPrices[`${product.id}-price`] ?? String(product.price)}
                  aria-label={`Precio propio retail de producto ${product.id}`}
                  className={OWN_PRICE_INPUT_CLASSES}
                  onChange={(event) => handlePriceChange(product.id, 'price', event)}
                  onBlur={(event) => handlePriceBlur(product, 'price', event)}
                />
                {retailError && (
                  <p className="mt-1 text-xs text-error">{retailError}</p>
                )}
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={
                    draftPrices[`${product.id}-price_wholesale`] ??
                    (product.price_wholesale === null ? '' : String(product.price_wholesale))
                  }
                  aria-label={`Precio propio mayorista de producto ${product.id}`}
                  className={OWN_PRICE_INPUT_CLASSES}
                  onChange={(event) => handlePriceChange(product.id, 'price_wholesale', event)}
                  onBlur={(event) => handlePriceBlur(product, 'price_wholesale', event)}
                />
                {wholesaleError && (
                  <p className="mt-1 text-xs text-error">{wholesaleError}</p>
                )}
              </td>
              <td className="px-3 py-2">
                <PriceLockBadge locked={product.price_locked} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
