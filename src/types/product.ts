export type ProductStatus = 'draft' | 'processing' | 'published' | 'failed'

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
}

export interface ProductsResponse {
  products: Product[]
  total: number
}
