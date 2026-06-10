'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { ImagePreview } from '@/components/camera/ImagePreview'
import { ProductForm } from '@/components/product/ProductForm'
import type { ProductFormData, AudioData } from '@/components/product/ProductForm'
import { apiPost, ApiClientError } from '@/lib/api'
import type { Product } from '@/types/product'

type Step = 'capturing' | 'previewing' | 'filling'

export default function NewProductPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('capturing')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleCapture = useCallback((file: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setImageFile(file)
    setStep('previewing')
  }, [])

  const handleRetake = useCallback(() => setStep('capturing'), [])
  const handleConfirm = useCallback(() => setStep('filling'), [])

  const handleSubmit = async (data: ProductFormData, audio?: AudioData) => {
    if (!imageFile) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('price', String(data.price))
      if (data.description) formData.append('description', data.description)
      formData.append('image', imageFile, imageFile.name)
      if (audio) {
        const ext = audio.mimeType.split('/')[1] ?? 'webm'
        formData.append('audio', audio.blob, `audio.${ext}`)
      }

      const result = await apiPost<{ product: Product }>('/api/v1/products', formData)
      router.push(`/product/${result.product.id}`)
    } catch (err) {
      setApiError(
        err instanceof ApiClientError ? err.message : 'Error al publicar el producto. Intentá de nuevo.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-[18px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B76]">Productos / Captura</p>
        <h1 className="mt-1 text-xl font-bold tracking-[-0.02em] md:text-2xl">Nuevo producto</h1>
        <p className="mt-1 text-sm text-[#8A8A96]">Capturá la foto y completá los datos para iniciar el procesamiento.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-0 shadow-panel md:p-6">
        {step === 'capturing' && (
          <CameraCapture onCapture={handleCapture} previewUrl={previewUrl} />
        )}

        {step === 'previewing' && previewUrl && (
          <ImagePreview
            previewUrl={previewUrl}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        )}

        {step === 'filling' && (
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              {apiError && (
                <div className="mx-4 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 md:mx-0 md:mt-0">
                  <p className="text-sm text-error">{apiError}</p>
                </div>
              )}
              <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
            </div>
            {previewUrl && (
              <aside className="px-4 pb-4 md:sticky md:top-[18px] md:w-72 md:px-0 md:pb-0">
                <p className="mb-2 text-[13px] font-medium text-[#A1A1AC]">Vista previa</p>
                <div className="overflow-hidden rounded-[20px] border border-border bg-[#0A0A0B]">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={previewUrl}
                      alt="Vista previa del producto"
                      fill
                      unoptimized
                      sizes="288px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-3/4 rounded bg-surface-input" />
                    <div className="h-4 w-2/5 rounded bg-surface-input" />
                    <div className="border-t border-border pt-3">
                      <div className="h-2 w-full rounded bg-surface-input" />
                      <div className="mt-2 h-2 w-2/3 rounded bg-surface-input" />
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-[#8A8A96]">Así se va a ver al publicar</p>
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
