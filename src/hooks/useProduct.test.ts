import { renderHook } from '@testing-library/react'
import { useProduct } from '@/hooks/useProduct'

const mockUseSWR = vi.hoisted(() => vi.fn())
vi.mock('swr', () => ({ default: mockUseSWR }))

describe('useProduct', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
  })

  it('llama a SWR con la URL del producto', () => {
    renderHook(() => useProduct('prod-abc'))
    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/v1/products/prod-abc',
      expect.any(Function),
      expect.any(Object),
    )
  })

  it('retorna el producto del data de SWR', () => {
    const product = { id: 'prod-abc', name: 'Almohada', status: 'published' }
    mockUseSWR.mockReturnValue({ data: { product }, error: undefined, isLoading: false })

    const { result } = renderHook(() => useProduct('prod-abc'))

    expect(result.current.product).toEqual(product)
    expect(result.current.isLoading).toBe(false)
  })

  it('retorna null cuando data es undefined', () => {
    const { result } = renderHook(() => useProduct('prod-abc'))
    expect(result.current.product).toBeNull()
  })

  it('retorna error cuando SWR tiene error', () => {
    const error = new Error('Not found')
    mockUseSWR.mockReturnValue({ data: undefined, error, isLoading: false })

    const { result } = renderHook(() => useProduct('prod-abc'))
    expect(result.current.error).toBe(error)
  })

  it('pasa refreshInterval al SWR para polling', () => {
    renderHook(() => useProduct('prod-abc'))
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
      expect.objectContaining({ refreshInterval: expect.anything() }),
    )
  })
})
