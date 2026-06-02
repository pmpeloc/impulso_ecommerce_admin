import { renderHook } from '@testing-library/react'
import { useProducts } from '@/hooks/useProducts'

const mockUseSWR = vi.hoisted(() => vi.fn())

vi.mock('swr', () => ({ default: mockUseSWR }))

describe('useProducts', () => {
  beforeEach(() => mockUseSWR.mockReset())

  it('llama a SWR con la URL correcta incluyendo page y limit', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })

    renderHook(() => useProducts(2, 10))

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/v1/products?page=2&limit=10',
      expect.any(Function),
    )
  })

  it('usa page=1 y limit=20 por defecto', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })

    renderHook(() => useProducts())

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/v1/products?page=1&limit=20',
      expect.any(Function),
    )
  })

  it('retorna products y total del data de SWR', () => {
    const products = [{ id: '1', name: 'Almohada' }]
    mockUseSWR.mockReturnValue({ data: { products, total: 5 }, error: undefined, isLoading: false })

    const { result } = renderHook(() => useProducts())

    expect(result.current.products).toEqual(products)
    expect(result.current.total).toBe(5)
    expect(result.current.isLoading).toBe(false)
  })

  it('retorna arrays vacíos y total 0 cuando data es undefined', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })

    const { result } = renderHook(() => useProducts())

    expect(result.current.products).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('expone el error de SWR', () => {
    const error = new Error('Network error')
    mockUseSWR.mockReturnValue({ data: undefined, error, isLoading: false })

    const { result } = renderHook(() => useProducts())

    expect(result.current.error).toBe(error)
  })
})
