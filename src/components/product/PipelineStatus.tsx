import { usePipeline } from '@/hooks/usePipeline'
import type { PipelineJobStatus, PublishChannel, PublishLogStatus } from '@/types/api'
import type { ProductStatus } from '@/types/product'

interface PipelineStatusProps {
  productId: string
  productStatus: ProductStatus
}

// ─── Labels & colors ──────────────────────────────────────────────────────────

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: 'En cola...',
  processing: 'Procesando...',
  published: '¡Publicado!',
  failed: 'Error en publicación',
}

const PRODUCT_STATUS_COLOR: Record<ProductStatus, string> = {
  draft: 'text-gray-500',
  processing: 'text-yellow-600',
  published: 'text-green-600',
  failed: 'text-red-600',
}

const JOB_STATUS_LABEL: Record<PipelineJobStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando...',
  done: 'Completado',
  failed: 'Error',
}

const JOB_STATUS_COLOR: Record<PipelineJobStatus, string> = {
  pending: 'text-gray-400',
  processing: 'text-yellow-600',
  done: 'text-green-600',
  failed: 'text-red-600',
}

const LOG_STATUS_LABEL: Record<PublishLogStatus, string> = {
  success: 'Publicado',
  failed: 'Error',
}

const LOG_STATUS_COLOR: Record<PublishLogStatus, string> = {
  success: 'text-green-600',
  failed: 'text-red-600',
}

const CHANNEL_LABELS: Record<PublishChannel, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  mercadolibre: 'Mercado Libre',
  ecommerce: 'Ecommerce',
}

const ACTIVE_CHANNELS: PublishChannel[] = ['whatsapp', 'facebook', 'mercadolibre']

// ─── Component ────────────────────────────────────────────────────────────────

export function PipelineStatus({ productId, productStatus }: PipelineStatusProps) {
  const { jobs, publishLogs, isLoading } = usePipeline(productId, productStatus)

  if (isLoading) {
    return (
      <div className="flex justify-center py-6" role="status" aria-label="Cargando estado del pipeline">
        <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const ingestionJob = jobs.find((j) => j.type === 'ingestion')
  const logByChannel = Object.fromEntries(publishLogs.map((l) => [l.channel, l]))

  return (
    <div className="space-y-5 p-4">
      {/* Estado general */}
      <div className="flex items-center gap-2">
        <span className={`font-semibold text-base ${PRODUCT_STATUS_COLOR[productStatus]}`}>
          {PRODUCT_STATUS_LABEL[productStatus]}
        </span>
      </div>

      {/* Procesamiento */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Procesamiento
        </h3>
        <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
          <span className="text-sm text-gray-700">Imagen y audio</span>
          {ingestionJob ? (
            <span className={`text-sm font-medium ${JOB_STATUS_COLOR[ingestionJob.status]}`}>
              {JOB_STATUS_LABEL[ingestionJob.status]}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Pendiente</span>
          )}
        </div>
      </section>

      {/* Publicación por canal */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Publicación por canal
        </h3>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {ACTIVE_CHANNELS.map((channel) => {
            const log = logByChannel[channel]
            return (
              <div key={channel} className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-700">{CHANNEL_LABELS[channel]}</span>
                {log ? (
                  <span className={`text-sm font-medium ${LOG_STATUS_COLOR[log.status]}`}>
                    {LOG_STATUS_LABEL[log.status]}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Pendiente</span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
