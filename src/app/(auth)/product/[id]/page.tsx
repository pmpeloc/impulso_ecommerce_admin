'use client'

import Link from 'next/link'
import { useProduct } from '@/hooks/useProduct'
import { PipelineStatus } from '@/components/product/PipelineStatus'

interface ProductDetailPageProps {
  params: { id: string }
}

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { product, isLoading, error } = useProduct(params.id)

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando producto" className="animate-pulse space-y-4 p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">No se pudo cargar el producto</p>
        <Link href="/dashboard" className="text-sm text-gray-500 underline mt-2 block">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const imgSrc = product.image_optimized_url ?? product.image_url

  return (
    <div className="max-w-lg mx-auto pb-4">
      {/* Back link */}
      <div className="px-4 pt-4 pb-2">
        <Link href="/dashboard" className="text-sm text-gray-500 flex items-center gap-1">
          <span aria-hidden="true">←</span> Volver
        </Link>
      </div>

      {/* Image */}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Sin imagen</span>
        </div>
      )}

      {/* Product info */}
      <div className="px-4 pt-4 space-y-1">
        <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-lg font-semibold text-gray-700">
          {priceFormatter.format(product.price)}
        </p>
        {product.description && (
          <p className="text-sm text-gray-500 pt-1">{product.description}</p>
        )}
      </div>

      {/* Pipeline status */}
      <div className="mt-6 border-t border-gray-100">
        <PipelineStatus productId={product.id} productStatus={product.status} />
      </div>
    </div>
  )
}
