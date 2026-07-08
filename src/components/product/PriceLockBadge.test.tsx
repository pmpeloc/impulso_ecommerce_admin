import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceLockBadge } from '@/components/product/PriceLockBadge'

describe('PriceLockBadge', () => {
  it('no renderiza nada cuando locked=false', () => {
    render(<PriceLockBadge locked={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renderiza el badge visible cuando locked=true', () => {
    render(<PriceLockBadge locked />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('llama a onUnlock al hacer click cuando locked=true', async () => {
    const onUnlock = vi.fn()
    const user = userEvent.setup()
    render(<PriceLockBadge locked onUnlock={onUnlock} />)

    await user.click(screen.getByRole('button'))
    expect(onUnlock).toHaveBeenCalledTimes(1)
  })
})
