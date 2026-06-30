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
  stock: z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v) ? -1 : v),
    z.number().int().min(0, 'La cantidad debe ser 0 o mayor'),
  ),
  description: z.string().optional(),
})

type ProductFormInput = z.input<typeof schema>
export type ProductFormData = z.output<typeof schema>

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
  } = useForm<ProductFormInput, unknown, ProductFormData>({ resolver: zodResolver(schema) })

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data, audio ?? undefined)
  }

  const handleRecorded = (blob: Blob, mimeType: string) => {
    setAudio({ blob, mimeType })
    setShowRecorder(false)
  }

  const loading = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-4 md:p-0" noValidate>
      <Input
        label="Nombre del producto"
        placeholder="ej: Almohada Premium"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Descripción"
        placeholder="Opcional — o grabá una descripción por audio"
        error={errors.description?.message}
        {...register('description')}
      />

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[#A1A1AC]">Descripción por audio</p>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-ai">Optimizado por IA</span>
        </div>
        {audio ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            <span className="font-medium text-success">✓ Audio grabado</span>
            <button
              type="button"
              onClick={() => setAudio(null)}
              className="text-xs text-[#8A8A96] underline hover:text-[#EDEDF0]"
            >
              Quitar
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowRecorder((v) => !v)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-[#A1A1AC] transition hover:border-border-strong hover:bg-surface-raised hover:text-[#EDEDF0]"
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

      <Input
        label="Precio (ARS)"
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        placeholder="0"
        error={errors.price?.message}
        className="font-mono tabular-nums"
        {...register('price', { valueAsNumber: true })}
      />

      <Input
        label="Cantidad disponible"
        type="number"
        inputMode="numeric"
        step="1"
        min="0"
        placeholder="ej: 10"
        error={errors.stock?.message}
        className="font-mono tabular-nums"
        {...register('stock', { valueAsNumber: true })}
      />

      <Button type="submit" isLoading={loading}>
        Publicar producto
      </Button>
    </form>
  )
}
