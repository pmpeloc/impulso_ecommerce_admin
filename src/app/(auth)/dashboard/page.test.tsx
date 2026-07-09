import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/app/(auth)/dashboard/page'
import type { Product } from '@/types/product'

const mockUseProducts = vi.hoisted(() => vi.fn())
const mockUseTenantConfig = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useProducts', () => ({ useProducts: mockUseProducts }))
vi.mock('@/hooks/useTenantConfig', () => ({ useTenantConfig: mockUseTenantConfig }))
vi.mock('@/components/product/ExternalCatalogTable', () => ({
  ExternalCatalogTable: ({ products }: { products: Product[] }) => (
    <div data-testid="external-catalog-table">{products.length} productos externos</div>
  ),
}))
const mockBulkPriceAdjustModal = vi.hoisted(() => vi.fn())
vi.mock('@/components/product/BulkPriceAdjustModal', () => ({
  BulkPriceAdjustModal: (props: { open: boolean; onClose: () => void }) => {
    mockBulkPriceAdjustModal(props)
    return <div data-testid="bulk-price-adjust-modal">{props.open ? 'open' : 'closed'}</div>
  },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}))

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  tenant_id: 'tid',
  name: 'Almohada Premium',
  description_transcription: null,
  description_optimized: null,
  price: 9999,
  status: 'published',
  image_url: null,
  image_optimized_url: null,
  image_ai_url: null,
  audio_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  source: 'own',
  external_source: null,
  external_id: null,
  external_category_id: null,
  source_price_retail: null,
  source_price_wholesale: null,
  source_fx_rate: null,
  price_wholesale: null,
  price_locked: false,
  stock_mode: 'manual',
  category: null,
  sku: null,
  stock: 0,
  ...overrides,
})

const idle = { isLoading: false, error: undefined }

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUseProducts.mockReset()
    mockUseTenantConfig.mockReset()
    // Default: sin mock explícito, useTenantConfig se comporta como si no hubiera
    // tenantConfig todavía (equivalente a 'own') — preserva el comportamiento de
    // los tests pre-existentes, que no lo mockean.
    mockUseTenantConfig.mockReturnValue({ tenantConfig: undefined, isLoading: false, error: undefined })
  })

  it('muestra spinner mientras carga', () => {
    mockUseProducts.mockReturnValue({ products: [], total: 0, isLoading: true, error: undefined })

    render(<DashboardPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renderiza las ProductCards de los productos', () => {
    mockUseProducts.mockReturnValue({
      products: [makeProduct({ name: 'Almohada Premium' }), makeProduct({ id: '2', name: 'Almohadon Grande' })],
      total: 2,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Almohada Premium')).toBeInTheDocument()
    expect(screen.getByText('Almohadon Grande')).toBeInTheDocument()
  })

  it('muestra mensaje vacío si no hay productos', () => {
    mockUseProducts.mockReturnValue({ products: [], total: 0, ...idle })

    render(<DashboardPage />)

    expect(screen.getByText(/no hay productos/i)).toBeInTheDocument()
  })

  it('muestra mensaje de error si la API falla', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      total: 0,
      isLoading: false,
      error: new Error('Network error'),
    })

    render(<DashboardPage />)

    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument()
  })

  it('renderiza el FAB de nuevo producto con href correcto', () => {
    mockUseProducts.mockReturnValue({ products: [], total: 0, ...idle })

    render(<DashboardPage />)

    expect(screen.getByRole('link', { name: /nuevo producto/i })).toHaveAttribute('href', '/product/new')
  })

  it('muestra paginación cuando hay más de una página', () => {
    const products = Array.from({ length: 20 }, (_, i) => makeProduct({ id: String(i), name: `Producto ${i}` }))
    mockUseProducts.mockReturnValue({ products, total: 40, ...idle })

    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument()
  })

  it('botón Anterior está deshabilitado en la primera página', () => {
    const products = Array.from({ length: 20 }, (_, i) => makeProduct({ id: String(i), name: `P${i}` }))
    mockUseProducts.mockReturnValue({ products, total: 40, ...idle })

    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
  })

  it('avanza de página al hacer click en Siguiente', async () => {
    const user = userEvent.setup()
    const products = Array.from({ length: 20 }, (_, i) => makeProduct({ id: String(i), name: `P${i}` }))
    mockUseProducts.mockReturnValue({ products, total: 40, ...idle })

    render(<DashboardPage />)
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(mockUseProducts).toHaveBeenLastCalledWith(2, 20)
  })

  it("product_source_mode 'own' — se comporta igual que sin tenantConfig (regresión)", () => {
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'own' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [makeProduct({ name: 'Almohada Premium' })],
      total: 1,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Almohada Premium')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /agregar producto/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /nuevo producto/i })).toBeInTheDocument()
    expect(screen.queryByTestId('external-catalog-table')).not.toBeInTheDocument()
  })

  it("tenantConfig undefined (loading) se comporta como 'own'", () => {
    mockUseTenantConfig.mockReturnValue({ tenantConfig: undefined, isLoading: true, error: undefined })
    mockUseProducts.mockReturnValue({
      products: [makeProduct({ name: 'Almohada Premium' })],
      total: 1,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Almohada Premium')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /agregar producto/i })).toBeInTheDocument()
    expect(screen.queryByTestId('external-catalog-table')).not.toBeInTheDocument()
  })

  it("product_source_mode 'external' — solo ExternalCatalogTable, sin botón de alta", () => {
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'external' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [
        makeProduct({ id: '1', name: 'Producto propio', source: 'own' }),
        makeProduct({ id: '2', name: 'Producto externo', source: 'external' }),
      ],
      total: 2,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByTestId('external-catalog-table')).toBeInTheDocument()
    expect(screen.getByText('1 productos externos')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /agregar producto/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /nuevo producto/i })).not.toBeInTheDocument()
  })

  it("product_source_mode 'hybrid' — ambas vistas presentes", () => {
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'hybrid' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [
        makeProduct({ id: '1', name: 'Producto propio', source: 'own' }),
        makeProduct({ id: '2', name: 'Producto externo', source: 'external' }),
      ],
      total: 2,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Producto propio')).toBeInTheDocument()
    expect(screen.getByTestId('external-catalog-table')).toBeInTheDocument()
    expect(screen.getByText('1 productos externos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /agregar producto/i })).toBeInTheDocument()
  })

  it("product_source_mode 'own' — el botón Ajustar precios no está en el DOM", () => {
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'own' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [makeProduct({ name: 'Almohada Premium' })],
      total: 1,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.queryByRole('button', { name: /ajustar precios/i })).not.toBeInTheDocument()
  })

  it("product_source_mode 'external' — el botón Ajustar precios está presente", () => {
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'external' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [makeProduct({ id: '2', name: 'Producto externo', source: 'external' })],
      total: 1,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: /ajustar precios/i })).toBeInTheDocument()
  })

  it("product_source_mode 'hybrid' — el botón Ajustar precios está presente", () => {
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'hybrid' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [
        makeProduct({ id: '1', name: 'Producto propio', source: 'own' }),
        makeProduct({ id: '2', name: 'Producto externo', source: 'external' }),
      ],
      total: 2,
      ...idle,
    })

    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: /ajustar precios/i })).toBeInTheDocument()
  })

  it('click en Ajustar precios (modo external) abre el modal', async () => {
    const user = userEvent.setup()
    mockUseTenantConfig.mockReturnValue({
      tenantConfig: { product_source_mode: 'external' },
      isLoading: false,
      error: undefined,
    })
    mockUseProducts.mockReturnValue({
      products: [makeProduct({ id: '2', name: 'Producto externo', source: 'external' })],
      total: 1,
      ...idle,
    })

    render(<DashboardPage />)
    await user.click(screen.getByRole('button', { name: /ajustar precios/i }))

    expect(mockBulkPriceAdjustModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: true }),
    )
  })
})
