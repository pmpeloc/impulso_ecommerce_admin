describe('Vitest setup', () => {
  it('está configurado correctamente', () => {
    expect(true).toBe(true)
  })

  it('jest-dom matchers están disponibles', () => {
    const el = document.createElement('div')
    el.textContent = 'hola'
    document.body.appendChild(el)
    expect(el).toBeInTheDocument()
    document.body.removeChild(el)
  })
})
