import Link from 'next/link'
import type { Product, ProductStatus } from '@/types/product'

interface ProductCardProps {
  product: Product
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Borrador',
  processing: 'Procesando',
  published: 'Publicado',
  failed: 'Error',
}

const STATUS_COLORS: Record<ProductStatus, string> = {
  draft: 'border-amber-500/30 bg-amber-500/10 text-warning',
  processing: 'border-purple-500/30 bg-purple-500/10 text-ai',
  published: 'border-emerald-500/30 bg-emerald-500/10 text-success',
  failed: 'border-red-500/30 bg-red-500/10 text-error',
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(product.price)

  const imgSrc = product.image_optimized_url ?? product.image_url
  const updatedAt = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(product.updated_at))

  return (
    <Link
      href={`/product/${product.id}`}
      className="group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-surface p-3 transition duration-150 hover:border-border-strong hover:bg-surface-raised active:scale-[0.995] md:grid-cols-[minmax(220px,2fr)_110px_120px_110px_74px] md:rounded-none md:border-x-0 md:border-t-0 md:px-4 md:py-2.5"
    >
      <div className="contents md:flex md:min-w-0 md:items-center md:gap-3">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="h-14 w-14 flex-shrink-0 rounded-lg object-cover md:h-10 md:w-10"
          />
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-[#30283C] text-[#8A8A96] md:h-10 md:w-10">
            <span className="text-lg" aria-hidden="true">◇</span>
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#EDEDF0]">{product.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-[#6B6B76]">{product.id}</p>
        </div>
      </div>

      <p className="col-start-2 row-start-2 font-mono text-sm font-semibold tabular-nums text-[#A1A1AC] md:col-auto md:row-auto md:text-[#EDEDF0]">
        {formattedPrice}
      </p>

      <span className={`col-start-3 row-span-2 row-start-1 inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium md:col-auto md:row-auto ${STATUS_COLORS[product.status]}`}>
        {product.status === 'processing' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ai" />}
        {STATUS_LABELS[product.status]}
      </span>

      <span className="hidden font-mono text-xs text-[#6B6B76] md:block">—</span>
      <span className="hidden text-xs text-[#8A8A96] md:block">{updatedAt}</span>
    </Link>
  )
}
