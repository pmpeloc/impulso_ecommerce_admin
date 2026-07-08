import useSWR from 'swr'
import { apiGet } from '@/lib/api'
import type { TenantConfig } from '@/types/tenant'

interface TenantConfigResponse {
  tenantConfig: TenantConfig
}

function fetcher(url: string): Promise<TenantConfigResponse> {
  return apiGet<TenantConfigResponse>(url)
}

export function useTenantConfig() {
  const { data, error, isLoading } = useSWR('/api/v1/admin/tenant-config', fetcher)

  return {
    tenantConfig: data?.tenantConfig,
    isLoading,
    error,
  }
}
