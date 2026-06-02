import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewProductPage from '@/app/(auth)/product/new/page'
import { ApiClientError } from '@/lib/api'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockApiPost = vi.hoisted(() => vi.fn())
const mockPush = vi.hoisted(() => vi.fn())
const mockCreateObjectURL = vi.hoisted(() => vi.fn(() => 'blob:mock-preview'))
const mockRevokeObjectURL = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', async (importActual) => {
  const actual = await importActual<typeof import('@/lib/api')>()
  return { ...actual, apiPost: mockApiPost }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/components/camera/CameraCapture', () => ({
  CameraCapture: ({ onCapture }: { onCapture: (f: File) => void }) => (
    <button onClick={() => onCapture(new File(['img'], 'photo.jpg', { type: 'image/jpeg' }))}>
      Mock Capturar
    </button>
  ),
}))

vi.mock('@/components/camera/ImagePreview', () => ({
  ImagePreview: ({ onRetake, onConfirm }: { onRetake: () => void; onConfirm: () => void }) => (
    <>
      <button onClick={onRetake}>Mock Retomar</button>
      <button onClick={onConfirm}>Mock Confirmar</button>
    </>
  ),
}))

vi.mock('@/components/product/ProductForm', () => ({
  ProductForm: ({ onSubmit }: { onSubmit: (d: object, a?: object) => Promise<void> }) => (
    <button onClick={() => onSubmit({ name: 'Almohada', price: 9999 })}>Mock Publicar</button>
  ),
}))

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NewProductPage', () => {
  beforeEach(() => {
    mockApiPost.mockReset()
    mockPush.mockReset()
    mockCreateObjectURL.mockReset()
    mockCreateObjectURL.mockReturnValue('blob:mock-preview')
    mockRevokeObjectURL.mockReset()
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('muestra CameraCapture como primer paso', () => {
    render(<NewProductPage />)
    expect(screen.getByText('Mock Capturar')).toBeInTheDocument()
  })

  it('después de capturar muestra ImagePreview', async () => {
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))

    expect(screen.getByText('Mock Confirmar')).toBeInTheDocument()
    expect(screen.queryByText('Mock Capturar')).not.toBeInTheDocument()
  })

  it('Retomar vuelve a CameraCapture', async () => {
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))
    await user.click(screen.getByText('Mock Retomar'))

    expect(screen.getByText('Mock Capturar')).toBeInTheDocument()
  })

  it('después de Confirmar muestra ProductForm', async () => {
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))
    await user.click(screen.getByText('Mock Confirmar'))

    expect(screen.getByText('Mock Publicar')).toBeInTheDocument()
  })

  it('al publicar llama a apiPost con FormData que contiene los campos correctos', async () => {
    mockApiPost.mockResolvedValue({ product: { id: 'nuevo-id' } })
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))
    await user.click(screen.getByText('Mock Confirmar'))
    await user.click(screen.getByText('Mock Publicar'))

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1))

    const [path, formData] = mockApiPost.mock.calls[0]
    expect(path).toBe('/api/v1/products')
    expect(formData).toBeInstanceOf(FormData)
    expect((formData as FormData).get('name')).toBe('Almohada')
    expect((formData as FormData).get('price')).toBe('9999')
    expect((formData as FormData).get('image')).toBeInstanceOf(File)
  })

  it('redirige a /product/[id] después del submit exitoso', async () => {
    mockApiPost.mockResolvedValue({ product: { id: 'nuevo-id' } })
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))
    await user.click(screen.getByText('Mock Confirmar'))
    await user.click(screen.getByText('Mock Publicar'))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/product/nuevo-id'))
  })

  it('muestra error de API si el submit falla', async () => {
    mockApiPost.mockRejectedValue(
      new ApiClientError({ code: 'SERVER_ERROR', message: 'Error del servidor', statusCode: 500 }),
    )
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))
    await user.click(screen.getByText('Mock Confirmar'))
    await user.click(screen.getByText('Mock Publicar'))

    expect(await screen.findByText(/error del servidor/i)).toBeInTheDocument()
  })

  it('crea el previewUrl al capturar', async () => {
    const user = userEvent.setup()
    render(<NewProductPage />)

    await user.click(screen.getByText('Mock Capturar'))

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
  })
})
