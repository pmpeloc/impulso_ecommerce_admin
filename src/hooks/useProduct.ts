import useSWR from 'swr'
import { apiGet } from '@/lib/api'
import type { Product, ProductStatus } from '@/types/product'

interface ProductResponse {
  product: Product
}

function fetcher(url: string): Promise<ProductResponse> {
  return apiGet<ProductResponse>(url)
}

const TERMINAL_STATUSES: ProductStatus[] = ['published', 'failed']

export function useProduct(id: string) {
  const { data, error, isLoading } = useSWR(
    `/api/v1/products/${id}`,
    fetcher,
    {
      refreshInterval: (current) => {
        const status = current?.product?.status
        return status && TERMINAL_STATUSES.includes(status) ? 0 : 5000
      },
    },
  )

  return {
    product: data?.product ?? null,
    isLoading,
    error,
  }
}
