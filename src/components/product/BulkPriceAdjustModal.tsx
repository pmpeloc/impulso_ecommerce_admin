import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { apiPost } from '@/lib/api'

interface BulkPriceAdjustModalProps {
  open: boolean
  onClose: () => void
}

type PriceType = 'retail' | 'wholesale' | 'both'

const SELECT_CLASSES =
  'w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-sm text-[#EDEDF0] outline-none transition duration-150 focus:border-brand focus:ring-2 focus:ring-indigo-500/20'

export function BulkPriceAdjustModal({ open, onClose }: BulkPriceAdjustModalProps) {
  const [priceType, setPriceType] = useState<PriceType>('retail')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updated, setUpdated] = useState<number | null>(null)

  if (!open) return null

  async function handleApply() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiPost<{ updated: number }>(
        '/api/v1/admin/products/bulk-price-adjust',
        { priceType },
      )
      setUpdated(response.updated)
    } catch {
      setError('No se pudo aplicar el ajuste de precios. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-panel">
        <h2 className="text-base font-semibold text-[#EDEDF0]">Ajuste masivo de precios</h2>

        <label htmlFor="bulk-price-adjust-type" className="mt-4 block text-sm text-[#A1A1AC]">
          Tipo de precio a ajustar
        </label>
        <select
          id="bulk-price-adjust-type"
          value={priceType}
          className={`${SELECT_CLASSES} mt-1`}
          onChange={(event) => setPriceType(event.target.value as PriceType)}
        >
          <option value="retail">Minorista</option>
          <option value="wholesale">Mayorista</option>
          <option value="both">Ambos</option>
        </select>

        <p className="mt-3 text-xs text-[#8A8A96]">
          Los productos con precio bloqueado 🔒 no se van a modificar.
        </p>

        {updated !== null && (
          <p className="mt-3 text-sm text-success">Se actualizaron {updated} productos.</p>
        )}

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button isLoading={isLoading} onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  )
}
