import { render, screen } from '@testing-library/react'
import ProductDetailPage from '@/app/(auth)/product/[id]/page'
import type { Product } from '@/types/product'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseProduct = vi.hoisted(() => vi.fn())
const mockPipelineStatusProps = vi.hoisted(() => ({ value: null as object | null }))

vi.mock('@/hooks/useProduct', () => ({ useProduct: mockUseProduct }))

vi.mock('@/components/product/PipelineStatus', () => ({
  PipelineStatus: (props: object) => {
    mockPipelineStatusProps.value = props
    return <div data-testid="pipeline-status">Pipeline Mock</div>
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/product/p1',
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 'p1',
  tenant_id: 'tid',
  name: 'Almohada Premium',
  description: 'Muy cómoda',
  price: 9999,
  status: 'published',
  image_url: 'https://cdn.example.com/original.jpg',
  image_optimized_url: 'https://cdn.example.com/optimized.jpg',
  image_ai_url: null,
  audio_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const loading = { product: null, isLoading: true, error: undefined }
const loaded = { product: mockProduct, isLoading: false, error: undefined }

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductDetailPage', () => {
  beforeEach(() => {
    mockUseProduct.mockReset()
    mockPipelineStatusProps.value = null
  })

  it('muestra skeleton de carga mientras isLoading=true', () => {
    mockUseProduct.mockReturnValue(loading)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra el nombre del producto', () => {
    mockUseProduct.mockReturnValue(loaded)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByText('Almohada Premium')).toBeInTheDocument()
  })

  it('muestra la descripción del producto', () => {
    mockUseProduct.mockReturnValue(loaded)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByText('Muy cómoda')).toBeInTheDocument()
  })

  it('muestra la imagen optimizada cuando está disponible', () => {
    mockUseProduct.mockReturnValue(loaded)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    const img = screen.getByRole('img', { name: /almohada premium/i })
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/optimized.jpg')
  })

  it('usa image_url como fallback si no hay image_optimized_url', () => {
    mockUseProduct.mockReturnValue({
      product: { ...mockProduct, image_optimized_url: null },
      isLoading: false,
      error: undefined,
    })
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn.example.com/original.jpg')
  })

  it('renderiza PipelineStatus con el productId correcto', () => {
    mockUseProduct.mockReturnValue(loaded)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByTestId('pipeline-status')).toBeInTheDocument()
    expect(mockPipelineStatusProps.value).toMatchObject({ productId: 'p1' })
  })

  it('pasa el productStatus correcto a PipelineStatus', () => {
    mockUseProduct.mockReturnValue(loaded)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(mockPipelineStatusProps.value).toMatchObject({ productStatus: 'published' })
  })

  it('tiene link de volver al dashboard', () => {
    mockUseProduct.mockReturnValue(loaded)
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute('href', '/dashboard')
  })

  it('muestra error si la API falla', () => {
    mockUseProduct.mockReturnValue({ product: null, isLoading: false, error: new Error('Not found') })
    render(<ProductDetailPage params={{ id: 'p1' }} />)
    expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument()
  })
})
