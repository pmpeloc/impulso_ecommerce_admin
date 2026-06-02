export type PipelineJobStatus = 'pending' | 'processing' | 'done' | 'failed'
export type PipelineJobType = 'ingestion' | 'publish'
export type PublishChannel = 'whatsapp' | 'facebook' | 'mercadolibre' | 'ecommerce'
export type PublishLogStatus = 'success' | 'failed'

export interface PipelineJob {
  id: string
  product_id: string
  type: PipelineJobType
  status: PipelineJobStatus
  error: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PublishLog {
  id: string
  product_id: string
  channel: PublishChannel
  status: PublishLogStatus
  external_id: string | null
  error: string | null
  published_at: string | null
}

export interface PipelineStatusResponse {
  jobs: PipelineJob[]
  publishLogs: PublishLog[]
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
}
