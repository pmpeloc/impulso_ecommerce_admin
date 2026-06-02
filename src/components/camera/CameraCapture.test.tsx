import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CameraCapture } from '@/components/camera/CameraCapture'

describe('CameraCapture', () => {
  it('renderiza el botón de captura', () => {
    render(<CameraCapture onCapture={vi.fn()} />)
    expect(screen.getByRole('button', { name: /tomar foto/i })).toBeInTheDocument()
  })

  it('llama a onCapture con el File cuando se selecciona una imagen', async () => {
    const onCapture = vi.fn()
    const user = userEvent.setup()
    render(<CameraCapture onCapture={onCapture} />)

    const file = new File(['image-content'], 'foto.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    expect(onCapture).toHaveBeenCalledTimes(1)
    expect(onCapture).toHaveBeenCalledWith(file)
  })

  it('muestra preview cuando se provee previewUrl', () => {
    render(<CameraCapture onCapture={vi.fn()} previewUrl="blob:mock-url" />)
    expect(screen.getByRole('img', { name: /foto capturada/i })).toBeInTheDocument()
  })

  it('no muestra preview si no hay previewUrl', () => {
    render(<CameraCapture onCapture={vi.fn()} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('el botón cambia su texto a "Retomar foto" cuando ya hay previewUrl', () => {
    render(<CameraCapture onCapture={vi.fn()} previewUrl="blob:mock-url" />)
    expect(screen.getByRole('button', { name: /retomar foto/i })).toBeInTheDocument()
  })

  it('el input tiene accept="image/*" y capture="environment"', () => {
    render(<CameraCapture onCapture={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', 'image/*')
    expect(input).toHaveAttribute('capture', 'environment')
  })
})
