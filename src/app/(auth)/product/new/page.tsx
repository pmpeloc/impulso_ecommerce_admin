'use client'

import { useState, useCallback } from 'react'
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
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">Nuevo producto</h1>
      </div>

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
        <>
          {apiError && (
            <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}
          <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </>
      )}
    </div>
  )
}
