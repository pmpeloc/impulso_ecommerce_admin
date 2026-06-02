import useSWR from 'swr'
import { apiGet } from '@/lib/api'
import type { Product, ProductsResponse } from '@/types/product'

function fetcher(url: string): Promise<ProductsResponse> {
  return apiGet<ProductsResponse>(url)
}

export function useProducts(page = 1, limit = 20) {
  const { data, error, isLoading } = useSWR(
    `/api/v1/products?page=${page}&limit=${limit}`,
    fetcher,
  )

  return {
    products: (data?.products ?? []) as Product[],
    total: data?.total ?? 0,
    isLoading,
    error,
  }
}
