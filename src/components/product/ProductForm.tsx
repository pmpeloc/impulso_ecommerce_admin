'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AudioRecorder } from '@/components/audio/AudioRecorder'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v) ? 0 : v),
    z.number().positive('El precio debe ser mayor a 0'),
  ),
  description: z.string().optional(),
})

export type ProductFormData = z.infer<typeof schema>

export interface AudioData {
  blob: Blob
  mimeType: string
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData, audio?: AudioData) => Promise<void>
  isLoading?: boolean
}

export function ProductForm({ onSubmit, isLoading = false }: ProductFormProps) {
  const [audio, setAudio] = useState<AudioData | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ resolver: zodResolver(schema) })

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data, audio ?? undefined)
  }

  const handleRecorded = (blob: Blob, mimeType: string) => {
    setAudio({ blob, mimeType })
    setShowRecorder(false)
  }

  const loading = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4" noValidate>
      <Input
        label="Nombre del producto"
        placeholder="ej: Almohada Premium"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Precio"
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        placeholder="ej: 9999"
        error={errors.price?.message}
        {...register('price', { valueAsNumber: true })}
      />

      <Input
        label="Descripción"
        placeholder="Opcional — o grabá una descripción por audio"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="pt-1">
        {audio ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">✓ Audio grabado</span>
            <button
              type="button"
              onClick={() => setAudio(null)}
              className="text-gray-400 underline text-xs"
            >
              Quitar
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowRecorder((v) => !v)}
              className="text-sm text-gray-500 underline"
            >
              {showRecorder ? 'Cancelar grabación' : 'Agregar descripción por audio'}
            </button>

            {showRecorder && (
              <div className="mt-3">
                <AudioRecorder onRecorded={handleRecorded} />
              </div>
            )}
          </>
        )}
      </div>

      <Button type="submit" isLoading={loading}>
        Publicar producto
      </Button>
    </form>
  )
}
