import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renderiza el label correctamente', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('asocia el label al input mediante htmlFor', () => {
    render(<Input label="Contraseña" name="password" />)
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  it('muestra el mensaje de error', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })

  it('no muestra error cuando no hay mensaje', () => {
    render(<Input label="Email" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('acepta input del usuario', async () => {
    const user = userEvent.setup()
    render(<Input label="Email" />)

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    expect(screen.getByLabelText('Email')).toHaveValue('test@test.com')
  })

  it('pasa props extras al input nativo', () => {
    render(<Input label="Email" type="email" placeholder="ej: juan@mail.com" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'ej: juan@mail.com')
  })
})
