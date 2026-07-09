import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/app/(auth)/dashboard/page'
import { apiPatch } from '@/lib/api'
import type { Product } from '@/types/product'

// Regresión: `dashboard/page.tsx` pasaba `products.filter(...)` inline a
// `ExternalCatalogTable`, lo que crea una nueva referencia de array en cada
// render del padre. El `useEffect` de resync de `ExternalCatalogTable` corre
// en cada cambio de referencia de `products` (no solo cuando los datos
// subyacentes cambian), así que un re-render no relacionado (ej: abrir el
// modal de "Ajustar precios") pisaba una edición de precio ya confirmada por
// el servidor con el valor stale del cache de `useProducts()`.
//
// Este test NO mockea `ExternalCatalogTable` — necesita el componente real
// para reproducir el bug end-to-end.

const mockUseProducts = vi.hoisted(() => vi.fn())
const mockUseTenantConfig = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useProducts', () => ({ useProducts: mockUseProducts }))
vi.mock('@/hooks/useTenantConfig', () => ({ useTenantConfig: mockUseTenantConfig }))
vi.mock('@/components/product/BulkPriceAdjustModal', () => ({
  BulkPriceAdjustModal: () => null,
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}))
vi.mock('@/lib/api', () => ({ apiPatch: vi.fn() }))

const mockedApiPatch = vi.mocked(apiPatch)

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  tenant_id: 'tid',
  name: 'Producto externo',
  description_transcription: null,
  description_optimized: null,
  price: 1000,
  status: 'published',
  image_url: null,
  image_optimized_url: null,
  image_ai_url: null,
  audio_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  source: 'external',
  external_source: 'distribuidora-victoria',
  external_id: 'ext-1',
  external_category_id: null,
  source_price_retail: 900,
  source_price_wholesale: 800,
  source_fx_rate: 1,
  price_wholesale: 950,
  price_locked: false,
  stock_mode: 'synced',
  category: 'Almohadones',
  sku: 'SKU-1',
  stock: 10,
  ...overrides,
})

describe('DashboardPage — regresión resync de ExternalCatalogTable', () => {
  beforeEach(() => {
    mockUseProducts.mockReset()
    mockUseTenantConfig.mockReset()
    mockedApiPatch.mockReset()
  })

  it('una edición de precio confirmada por el servidor sobrevive a un re-render del padre no relacionado con los datos (abrir modal)', async () => {
    const product = makeProduct()
    // Referencia ESTABLE de `products` — simula que `useProducts()` (SWR) no
    // refetcheó: los datos subyacentes no cambiaron entre renders.
    const stableProducts = [product]
    mockUseProducts.mockReturnValue({
      products: stableProducts,
      total: 1,
      isLoading: false,
      error: undefined,
    })
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'external' },
      isLoading: false,
      error: undefined,
    })
    mockedApiPatch.mockResolvedValue({ product: { ...product, price: 1500 } })

    render(<DashboardPage />)

    const input = screen.getByLabelText('Precio propio retail de producto 1') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1500' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(input.value).toBe('1500')
    })

    // Re-render del padre disparado por estado NO relacionado con `products`:
    // abrir el modal de ajuste masivo de precios. Antes del fix, el `.filter()`
    // inline recreaba el array pasado a `ExternalCatalogTable` en cada render,
    // lo que reseteaba la tabla al valor stale (1000) del mock de `useProducts()`.
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /ajustar precios/i }))

    expect(input.value).toBe('1500')
  })
})
