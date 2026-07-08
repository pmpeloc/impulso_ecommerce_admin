export type ProductSourceMode = 'own' | 'external' | 'hybrid'
export type CheckoutMethod = 'mobbex' | 'whatsapp'

export interface TenantConfig {
  id: string
  tenant_id: string
  client_name: string
  brand_color: string
  logo_url: string | null
  favicon_url: string | null
  email_from: string | null
  whatsapp_number: string | null
  whatsapp_message: string | null
  meta_catalog_id: string | null
  meta_access_token: string | null
  meta_page_id: string | null
  product_source_mode: ProductSourceMode
  markup_retail_pct: number | null
  markup_wholesale_pct: number | null
  checkout_methods: CheckoutMethod[]
  external_connector_config: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
