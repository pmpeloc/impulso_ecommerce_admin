export type ProductStatus = 'draft' | 'processing' | 'published' | 'failed'
export type ProductSource = 'own' | 'external'
export type StockMode = 'synced' | 'manual'

export interface Product {
  id: string
  tenant_id: string
  name: string
  description_transcription: string | null
  description_optimized: string | null
  price: number
  status: ProductStatus
  image_url: string | null
  image_optimized_url: string | null
  image_ai_url: string | null
  audio_url: string | null
  created_at: string
  updated_at: string
  source: ProductSource
  external_source: string | null
  external_id: string | null
  external_category_id: string | null
  source_price_retail: number | null
  source_price_wholesale: number | null
  source_fx_rate: number | null
  price_wholesale: number | null
  price_locked: boolean
  stock_mode: StockMode
}

export interface ProductsResponse {
  products: Product[]
  total: number
}
