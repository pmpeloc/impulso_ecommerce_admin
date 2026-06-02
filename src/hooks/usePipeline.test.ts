import { renderHook } from '@testing-library/react'
import { usePipeline } from '@/hooks/usePipeline'

const mockUseSWR = vi.hoisted(() => vi.fn())
vi.mock('swr', () => ({ default: mockUseSWR }))

describe('usePipeline', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
  })

  it('llama a SWR con la URL correcta del pipeline', () => {
    renderHook(() => usePipeline('prod-abc', 'processing'))

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/v1/products/prod-abc/pipeline',
      expect.any(Function),
      expect.any(Object),
    )
  })

  it('refreshInterval es 2000 cuando status es "draft"', () => {
    renderHook(() => usePipeline('p1', 'draft'))
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String), expect.any(Function),
      expect.objectContaining({ refreshInterval: 2000 }),
    )
  })

  it('refreshInterval es 2000 cuando status es "processing"', () => {
    renderHook(() => usePipeline('p1', 'processing'))
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String), expect.any(Function),
      expect.objectContaining({ refreshInterval: 2000 }),
    )
  })

  it('refreshInterval es 0 cuando status es "published" (polling detenido)', () => {
    renderHook(() => usePipeline('p1', 'published'))
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String), expect.any(Function),
      expect.objectContaining({ refreshInterval: 0 }),
    )
  })

  it('refreshInterval es 0 cuando status es "failed" (polling detenido)', () => {
    renderHook(() => usePipeline('p1', 'failed'))
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String), expect.any(Function),
      expect.objectContaining({ refreshInterval: 0 }),
    )
  })

  it('retorna jobs y publishLogs del data de SWR', () => {
    const jobs = [{ id: '1', type: 'ingestion', status: 'done' }]
    const publishLogs = [{ id: '2', channel: 'whatsapp', status: 'success' }]
    mockUseSWR.mockReturnValue({ data: { jobs, publishLogs }, error: undefined, isLoading: false })

    const { result } = renderHook(() => usePipeline('p1', 'published'))

    expect(result.current.jobs).toEqual(jobs)
    expect(result.current.publishLogs).toEqual(publishLogs)
    expect(result.current.isLoading).toBe(false)
  })

  it('retorna arrays vacíos cuando data es undefined', () => {
    const { result } = renderHook(() => usePipeline('p1', 'processing'))
    expect(result.current.jobs).toEqual([])
    expect(result.current.publishLogs).toEqual([])
  })
})
