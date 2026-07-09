import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkPriceAdjustModal } from '@/components/product/BulkPriceAdjustModal'
import { apiPost } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiPost: vi.fn(),
}))

const mockedApiPost = vi.mocked(apiPost)

describe('BulkPriceAdjustModal', () => {
  beforeEach(() => {
    mockedApiPost.mockReset()
  })

  it('open={false} no renderiza nada', () => {
    const { container } = render(<BulkPriceAdjustModal open={false} onClose={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('open={true} renderiza el select y los botones', () => {
    render(<BulkPriceAdjustModal open={true} onClose={vi.fn()} />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('seleccionar "Mayorista" y click en Aplicar dispara apiPost con priceType wholesale', async () => {
    mockedApiPost.mockResolvedValue({ updated: 5 })

    render(<BulkPriceAdjustModal open={true} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'wholesale' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledWith(
        '/api/v1/admin/products/bulk-price-adjust',
        { priceType: 'wholesale' },
      )
    })
  })

  it('seleccionar "Ambos" y click en Aplicar dispara apiPost con priceType both', async () => {
    mockedApiPost.mockResolvedValue({ updated: 3 })

    render(<BulkPriceAdjustModal open={true} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'both' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledWith(
        '/api/v1/admin/products/bulk-price-adjust',
        { priceType: 'both' },
      )
    })
  })

  it('éxito muestra el número real de productos actualizados devuelto por la API', async () => {
    mockedApiPost.mockResolvedValue({ updated: 12 })

    render(<BulkPriceAdjustModal open={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => {
      expect(screen.getByText(/12/)).toBeInTheDocument()
    })
  })

  it('error de apiPost muestra mensaje inline y el modal sigue abierto', async () => {
    mockedApiPost.mockRejectedValue(new Error('network error'))

    render(<BulkPriceAdjustModal open={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => {
      expect(screen.getByText(/no se pudo/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('click en Cancelar llama a onClose', () => {
    const onClose = vi.fn()
    render(<BulkPriceAdjustModal open={true} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
