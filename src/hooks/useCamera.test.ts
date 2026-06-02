import { renderHook, act } from '@testing-library/react'
import { useCamera } from '@/hooks/useCamera'

const mockCreateObjectURL = vi.fn(() => 'blob:mock-preview-url')
const mockRevokeObjectURL = vi.fn()

describe('useCamera', () => {
  beforeEach(() => {
    mockCreateObjectURL.mockReset()
    mockCreateObjectURL.mockReturnValue('blob:mock-preview-url')
    mockRevokeObjectURL.mockReset()
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('inicia con file y previewUrl nulos', () => {
    const { result } = renderHook(() => useCamera())
    expect(result.current.file).toBeNull()
    expect(result.current.previewUrl).toBeNull()
  })

  it('onFileChange setea el file y crea el previewUrl', () => {
    const { result } = renderHook(() => useCamera())
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    act(() => result.current.onFileChange(file))

    expect(result.current.file).toBe(file)
    expect(result.current.previewUrl).toBe('blob:mock-preview-url')
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file)
  })

  it('onFileChange revoca la URL anterior si existía', () => {
    const { result } = renderHook(() => useCamera())
    const file1 = new File(['img1'], 'photo1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['img2'], 'photo2.jpg', { type: 'image/jpeg' })

    act(() => result.current.onFileChange(file1))
    mockCreateObjectURL.mockReturnValue('blob:second-url')
    act(() => result.current.onFileChange(file2))

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-preview-url')
  })

  it('reset limpia file y previewUrl', () => {
    const { result } = renderHook(() => useCamera())
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    act(() => result.current.onFileChange(file))
    act(() => result.current.reset())

    expect(result.current.file).toBeNull()
    expect(result.current.previewUrl).toBeNull()
  })

  it('reset revoca la URL al limpiar', () => {
    const { result } = renderHook(() => useCamera())
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    act(() => result.current.onFileChange(file))
    act(() => result.current.reset())

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-preview-url')
  })
})
