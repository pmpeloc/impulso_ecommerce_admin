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
  draft: 'bg-gray-100 text-gray-600',
  processing: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(product.price)

  const imgSrc = product.image_optimized_url ?? product.image_url

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center active:bg-gray-50 transition-colors">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center leading-tight px-1">Sin imagen</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{formattedPrice}</p>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[product.status]}`}>
            {STATUS_LABELS[product.status]}
          </span>
        </div>
      </div>
    </Link>
  )
}
