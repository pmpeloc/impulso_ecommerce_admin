import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from '@/components/product/ProductForm'

// Mock AudioRecorder so tests don't need MediaRecorder
vi.mock('@/components/audio/AudioRecorder', () => ({
  AudioRecorder: ({ onRecorded }: { onRecorded: (blob: Blob, mimeType: string) => void }) => (
    <button
      type="button"
      onClick={() => onRecorded(new Blob(['audio'], { type: 'audio/webm' }), 'audio/webm')}
    >
      Mock Grabar
    </button>
  ),
}))

describe('ProductForm', () => {
  const onSubmit = vi.fn()

  beforeEach(() => onSubmit.mockReset())

  it('renderiza campos nombre, precio y descripción', () => {
    render(<ProductForm onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
  })

  it('muestra error de validación si el nombre está vacío', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(await screen.findByText(/nombre es requerido/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra error si el precio está vacío o es cero', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/nombre/i), 'Almohada')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(await screen.findByText(/mayor a 0/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra error si el precio es negativo', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/nombre/i), 'Almohada')
    await user.type(screen.getByLabelText(/precio/i), '-100')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(await screen.findByText(/mayor a 0/i)).toBeInTheDocument()
  })

  it('puede submittear sin descripción (opcional)', async () => {
    onSubmit.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/nombre/i), 'Almohada')
    await user.type(screen.getByLabelText(/precio/i), '9999')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Almohada', price: 9999 }),
        undefined,
      )
    })
  })

  it('llama a onSubmit con datos tipados correctamente', async () => {
    onSubmit.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/nombre/i), 'Almohada Premium')
    await user.type(screen.getByLabelText(/precio/i), '15000')
    await user.type(screen.getByLabelText(/descripción/i), 'Muy cómoda')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { name: 'Almohada Premium', price: 15000, description: 'Muy cómoda' },
        undefined,
      )
    })
  })

  it('muestra estado loading cuando isLoading=true', () => {
    render(<ProductForm onSubmit={onSubmit} isLoading />)

    const btn = screen.getByRole('button', { name: /cargando/i })
    expect(btn).toBeDisabled()
  })

  it('tiene botón toggle para mostrar AudioRecorder', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    const toggle = screen.getByRole('button', { name: /agregar descripción por audio/i })
    expect(toggle).toBeInTheDocument()

    await user.click(toggle)

    expect(screen.getByText(/mock grabar/i)).toBeInTheDocument()
  })

  it('llama a onSubmit con audio cuando se grabó descripción', async () => {
    onSubmit.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /agregar descripción por audio/i }))
    await user.click(screen.getByText(/mock grabar/i))

    await user.type(screen.getByLabelText(/nombre/i), 'Almohada')
    await user.type(screen.getByLabelText(/precio/i), '9999')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Almohada', price: 9999 }),
        expect.objectContaining({ mimeType: 'audio/webm' }),
      )
    })
  })

  it('muestra confirmación visual cuando hay audio grabado', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /agregar descripción por audio/i }))
    await user.click(screen.getByText(/mock grabar/i))

    expect(screen.getByText(/audio grabado/i)).toBeInTheDocument()
  })
})
