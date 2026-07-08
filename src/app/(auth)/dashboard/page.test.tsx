import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/app/(auth)/dashboard/page'
import type { Product } from '@/types/product'

const mockUseProducts = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useProducts', () => ({ useProducts: mockUseProducts }))
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
  beforeEach(() => mockUseProducts.mockReset())

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
})
