import Image from 'next/image'
import type { Product } from '@/types/product'
import { PriceLockBadge } from '@/components/product/PriceLockBadge'

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

export function ExternalCatalogTable({ products }: ExternalCatalogTableProps) {
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
        {products.map((product) => {
          const imgSrc = product.image_optimized_url ?? product.image_url

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
                  defaultValue={product.price}
                  aria-label={`Precio propio retail de producto ${product.id}`}
                  className={OWN_PRICE_INPUT_CLASSES}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  defaultValue={product.price_wholesale ?? undefined}
                  aria-label={`Precio propio mayorista de producto ${product.id}`}
                  className={OWN_PRICE_INPUT_CLASSES}
                />
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
