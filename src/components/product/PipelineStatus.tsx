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
  draft: 'text-[#8A8A96]',
  processing: 'text-ai',
  published: 'text-success',
  failed: 'text-error',
}

const JOB_STATUS_LABEL: Record<PipelineJobStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando...',
  done: 'Completado',
  failed: 'Error',
}

const JOB_STATUS_COLOR: Record<PipelineJobStatus, string> = {
  pending: 'text-[#8A8A96]',
  processing: 'text-ai',
  done: 'text-success',
  failed: 'text-error',
}

const LOG_STATUS_LABEL: Record<PublishLogStatus, string> = {
  success: 'Publicado',
  failed: 'Error',
}

const LOG_STATUS_COLOR: Record<PublishLogStatus, string> = {
  success: 'text-success',
  failed: 'text-error',
}

const CHANNEL_LABELS: Record<PublishChannel, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  mercadolibre: 'Mercado Libre',
  ecommerce: 'Ecommerce',
}

const ACTIVE_CHANNELS = ['whatsapp', 'facebook', 'mercadolibre'] as const satisfies readonly PublishChannel[]

const CHANNEL_INITIALS: Record<(typeof ACTIVE_CHANNELS)[number], string> = {
  whatsapp: 'W',
  facebook: 'f',
  mercadolibre: 'ML',
}

const CHANNEL_COLORS: Record<(typeof ACTIVE_CHANNELS)[number], string> = {
  whatsapp: 'bg-[#25D366] text-white',
  facebook: 'bg-[#1877F2] text-white',
  mercadolibre: 'bg-[#FFE600] text-[#1A1A1D]',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PipelineStatus({ productId, productStatus }: PipelineStatusProps) {
  const { jobs, publishLogs, isLoading } = usePipeline(productId, productStatus)

  if (isLoading) {
    return (
      <div className="flex justify-center py-8" role="status" aria-label="Cargando estado del pipeline">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-brand" />
      </div>
    )
  }

  const ingestionJob = jobs.find((j) => j.type === 'ingestion')
  const logByChannel = Object.fromEntries(publishLogs.map((l) => [l.channel, l]))

  return (
    <div className="space-y-6">
      {/* Estado general */}
      <div className="flex items-center gap-2">
        {productStatus === 'processing' && <span className="h-2 w-2 animate-pulse rounded-full bg-ai" />}
        <span className={`text-sm font-semibold ${PRODUCT_STATUS_COLOR[productStatus]}`}>
          {PRODUCT_STATUS_LABEL[productStatus]}
        </span>
      </div>

      {/* Procesamiento */}
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8A96]">
          Procesamiento
        </h3>
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3.5">
          <div>
            <span className="text-sm font-medium text-[#EDEDF0]">Imagen y audio</span>
            <p className="mt-0.5 text-xs text-[#8A8A96]">Optimización y transcripción</p>
          </div>
          {ingestionJob ? (
            <span className={`text-sm font-medium ${JOB_STATUS_COLOR[ingestionJob.status]}`}>
              {JOB_STATUS_LABEL[ingestionJob.status]}
            </span>
          ) : (
            <span className="text-sm text-[#8A8A96]">Pendiente</span>
          )}
        </div>
      </section>

      {/* Publicación por canal */}
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8A96]">
          Publicación por canal
        </h3>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {ACTIVE_CHANNELS.map((channel) => {
            const log = logByChannel[channel]
            return (
              <div key={channel} className="flex items-center justify-between p-3.5">
                <span className="flex items-center gap-3 text-sm font-medium text-[#EDEDF0]">
                  <span className={`grid h-7 w-7 place-items-center rounded-md text-[10px] font-bold ${CHANNEL_COLORS[channel]}`}>
                    {CHANNEL_INITIALS[channel]}
                  </span>
                  {CHANNEL_LABELS[channel]}
                </span>
                {log ? (
                  <span className={`text-sm font-medium ${LOG_STATUS_COLOR[log.status]}`}>
                    {LOG_STATUS_LABEL[log.status]}
                  </span>
                ) : (
                  <span className="text-sm text-[#8A8A96]">Pendiente</span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
