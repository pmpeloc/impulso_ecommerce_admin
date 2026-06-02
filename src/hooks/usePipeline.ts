import useSWR from 'swr'
import { apiGet } from '@/lib/api'
import type { PipelineJob, PublishLog, PipelineStatusResponse } from '@/types/api'
import type { ProductStatus } from '@/types/product'

function fetcher(url: string): Promise<PipelineStatusResponse> {
  return apiGet<PipelineStatusResponse>(url)
}

export function usePipeline(productId: string, productStatus: ProductStatus) {
  const shouldPoll = productStatus !== 'published' && productStatus !== 'failed'

  const { data, error, isLoading } = useSWR(
    `/api/v1/products/${productId}/pipeline`,
    fetcher,
    { refreshInterval: shouldPoll ? 2000 : 0 },
  )

  return {
    jobs: (data?.jobs ?? []) as PipelineJob[],
    publishLogs: (data?.publishLogs ?? []) as PublishLog[],
    isLoading,
    error,
  }
}
