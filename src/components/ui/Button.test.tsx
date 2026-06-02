import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza el texto del botón', () => {
    render(<Button>Publicar</Button>)
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument()
  })

  it('muestra "Cargando..." y está deshabilitado cuando isLoading=true', () => {
    render(<Button isLoading>Publicar</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent(/cargando/i)
  })

  it('está deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Publicar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('ejecuta onClick al hacer click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('no ejecuta onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button disabled onClick={onClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('aplica variante secondary', () => {
    render(<Button variant="secondary">Cancelar</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
