import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImagePreview } from '@/components/camera/ImagePreview'

const PREVIEW_URL = 'blob:mock-preview-url'

describe('ImagePreview', () => {
  it('muestra la imagen con el src correcto', () => {
    render(<ImagePreview previewUrl={PREVIEW_URL} onRetake={vi.fn()} onConfirm={vi.fn()} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', PREVIEW_URL)
  })

  it('la imagen tiene alt descriptivo', () => {
    render(<ImagePreview previewUrl={PREVIEW_URL} onRetake={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByAltText(/vista previa/i)).toBeInTheDocument()
  })

  it('botón Retomar llama a onRetake()', async () => {
    const onRetake = vi.fn()
    const user = userEvent.setup()
    render(<ImagePreview previewUrl={PREVIEW_URL} onRetake={onRetake} onConfirm={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /retomar/i }))

    expect(onRetake).toHaveBeenCalledTimes(1)
  })

  it('botón Continuar llama a onConfirm()', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ImagePreview previewUrl={PREVIEW_URL} onRetake={vi.fn()} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('renderiza ambos botones', () => {
    render(<ImagePreview previewUrl={PREVIEW_URL} onRetake={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retomar/i })).toBeInTheDocument()
  })
})
