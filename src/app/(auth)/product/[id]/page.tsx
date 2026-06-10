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
      <div role="status" aria-label="Cargando producto" className="mx-auto max-w-5xl animate-pulse space-y-4 p-4 md:p-[18px]">
        <div className="h-6 w-3/4 rounded bg-surface-input" />
        <div className="aspect-square max-w-sm rounded-2xl bg-surface-input" />
        <div className="h-4 w-1/2 rounded bg-surface-input" />
        <div className="h-4 w-2/3 rounded bg-surface-input" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-6 text-center">
        <p className="text-error">No se pudo cargar el producto</p>
        <Link href="/dashboard" className="mt-2 block text-sm text-[#8A8A96] underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const imgSrc = product.image_optimized_url ?? product.image_url

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-[18px]">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-[#8A8A96] transition hover:text-[#EDEDF0]">
          <span aria-hidden="true">←</span> Volver
        </Link>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <div className="relative overflow-hidden rounded-[20px] border border-border bg-surface">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-[#30283C]">
                <span className="text-sm text-[#8A8A96]">Sin imagen</span>
              </div>
            )}
            {product.image_optimized_url && (
              <span className="absolute left-3 top-3 rounded-full border border-purple-500/30 bg-[#0A0A0BB3] px-2.5 py-1 text-[11px] font-medium text-ai backdrop-blur-lg">
                Imagen optimizada
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-[1.3] space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8A96]">Detalle del producto</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold tracking-[-0.02em] md:text-2xl">{product.name}</h1>
              <span className="rounded-full border border-border-strong bg-surface-input px-2.5 py-1 text-xs text-[#A1A1AC]">
                {product.status === 'published' ? 'Publicado' : product.status === 'processing' ? 'Procesando' : product.status === 'failed' ? 'Error' : 'Borrador'}
              </span>
            </div>
            <p className="mt-3 font-mono text-lg font-semibold tabular-nums">{priceFormatter.format(product.price)}</p>
            <p className="mt-1 truncate font-mono text-xs text-[#6B6B76]">{product.id}</p>
          </div>

          {(product.description_optimized ?? product.description_transcription) && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8A96]">Descripción</p>
                {product.description_optimized && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-ai">Optimizado por IA</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-[#A1A1AC]">
                {product.description_optimized ?? product.description_transcription}
              </p>
            </div>
          )}

          <PipelineStatus productId={product.id} productStatus={product.status} />
        </div>
      </div>
    </div>
  )
}
