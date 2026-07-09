import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { ExternalCatalogTable } from '@/components/product/ExternalCatalogTable'
import { apiPatch } from '@/lib/api'
import type { Product } from '@/types/product'

vi.mock('@/lib/api', () => ({
  apiPatch: vi.fn(),
}))

const mockedApiPatch = vi.mocked(apiPatch)

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    tenant_id: 'tenant-1',
    name: 'Producto de prueba',
    description_transcription: null,
    description_optimized: null,
    price: 1000,
    status: 'published',
    image_url: null,
    image_optimized_url: null,
    image_ai_url: null,
    audio_url: null,
    created_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-01T00:00:00.000Z',
    source: 'external',
    external_source: 'distribuidora-victoria',
    external_id: 'ext-1',
    external_category_id: null,
    source_price_retail: 900,
    source_price_wholesale: 800,
    source_fx_rate: 1,
    price_wholesale: 950,
    price_locked: false,
    stock_mode: 'synced',
    category: 'Almohadones',
    sku: 'SKU-1',
    stock: 10,
    ...overrides,
  }
}

describe('ExternalCatalogTable', () => {
  beforeEach(() => {
    mockedApiPatch.mockReset()
  })

  it('renderiza una fila por producto, con el nombre visible', () => {
    const products = [
      createProduct({ id: 'prod-1', name: 'Almohadón Deluxe' }),
      createProduct({ id: 'prod-2', name: 'Almohadón Estándar' }),
    ]

    render(<ExternalCatalogTable products={products} />)

    expect(screen.getByText('Almohadón Deluxe')).toBeInTheDocument()
    expect(screen.getByText('Almohadón Estándar')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(products.length + 1) // +1 header
  })

  it('renderiza el precio origen (retail y mayorista) como texto, no como input', () => {
    const products = [
      createProduct({ id: 'prod-1', source_price_retail: 900, source_price_wholesale: 800 }),
    ]

    render(<ExternalCatalogTable products={products} />)

    expect(screen.getByText('900')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(2) // solo los inputs propios
  })

  it('renderiza el precio propio (retail y mayorista) como input type=number con el valor actual', () => {
    const products = [
      createProduct({ id: 'prod-1', price: 1200, price_wholesale: 1100 }),
    ]

    render(<ExternalCatalogTable products={products} />)

    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(inputs).toHaveLength(2)
    expect(inputs.map((input) => input.value).sort()).toEqual(['1100', '1200'])
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  it('muestra PriceLockBadge visible cuando price_locked=true y ausente cuando price_locked=false', () => {
    const products = [
      createProduct({ id: 'prod-locked', name: 'Producto trabado', price_locked: true }),
      createProduct({ id: 'prod-unlocked', name: 'Producto libre', price_locked: false }),
    ]

    render(<ExternalCatalogTable products={products} />)

    const rows = screen.getAllByRole('row').slice(1) // sin header
    const lockedRow = rows.find((row) => within(row).queryByText('Producto trabado'))
    const unlockedRow = rows.find((row) => within(row).queryByText('Producto libre'))

    expect(lockedRow).toBeDefined()
    expect(unlockedRow).toBeDefined()
    expect(within(lockedRow as HTMLElement).getByRole('button')).toBeInTheDocument()
    expect(within(unlockedRow as HTMLElement).queryByRole('button')).not.toBeInTheDocument()
  })

  it('edita el precio propio retail y en blur dispara PATCH con el nuevo valor', async () => {
    const product = createProduct({ id: 'prod-1', price: 1000 })
    mockedApiPatch.mockResolvedValue({ product: { ...product, price: 1500 } })

    render(<ExternalCatalogTable products={[product]} />)

    const input = screen.getByLabelText('Precio propio retail de producto prod-1')
    fireEvent.change(input, { target: { value: '1500' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockedApiPatch).toHaveBeenCalledWith('/api/v1/admin/products/prod-1', { price: 1500 })
    })
  })

  it('blur sin cambiar el valor no dispara PATCH', async () => {
    const product = createProduct({ id: 'prod-1', price: 1000 })

    render(<ExternalCatalogTable products={[product]} />)

    const input = screen.getByLabelText('Precio propio retail de producto prod-1')
    fireEvent.focus(input)
    fireEvent.blur(input)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockedApiPatch).not.toHaveBeenCalled()
  })

  it('cuando el PATCH resuelve con price_locked=true, el PriceLockBadge de esa fila aparece', async () => {
    const product = createProduct({ id: 'prod-1', name: 'Producto trabable', price: 1000, price_locked: false })
    mockedApiPatch.mockResolvedValue({
      product: { ...product, price: 1500, price_locked: true },
    })

    render(<ExternalCatalogTable products={[product]} />)

    const input = screen.getByLabelText('Precio propio retail de producto prod-1')
    fireEvent.change(input, { target: { value: '1500' } })
    fireEvent.blur(input)

    const row = screen.getByText('Producto trabable').closest('tr') as HTMLElement
    await waitFor(() => {
      expect(within(row).getByRole('button')).toBeInTheDocument()
    })
  })

  it('cuando el PATCH resuelve con un price distinto al tipeado, el input muestra el valor del servidor (no el tipeado)', async () => {
    const product = createProduct({ id: 'prod-1', price: 1000 })
    mockedApiPatch.mockResolvedValue({
      product: { ...product, price: 1499, price_locked: true },
    })

    render(<ExternalCatalogTable products={[product]} />)

    const input = screen.getByLabelText('Precio propio retail de producto prod-1') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1500' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(input.value).toBe('1499')
    })
  })

  it('cuando el PATCH rechaza, el input vuelve a mostrar el valor original', async () => {
    const product = createProduct({ id: 'prod-1', price: 1000 })
    mockedApiPatch.mockRejectedValue(new Error('network error'))

    render(<ExternalCatalogTable products={[product]} />)

    const input = screen.getByLabelText('Precio propio retail de producto prod-1') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1500' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(input.value).toBe('1000')
    })
  })

  it('edita el precio propio mayorista y en blur dispara PATCH con price_wholesale', async () => {
    const product = createProduct({ id: 'prod-1', price_wholesale: 950 })
    mockedApiPatch.mockResolvedValue({ product: { ...product, price_wholesale: 1300 } })

    render(<ExternalCatalogTable products={[product]} />)

    const input = screen.getByLabelText('Precio propio mayorista de producto prod-1')
    fireEvent.change(input, { target: { value: '1300' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockedApiPatch).toHaveBeenCalledWith('/api/v1/admin/products/prod-1', { price_wholesale: 1300 })
    })
  })

  it('click en el PriceLockBadge de una fila trabada dispara PATCH a /price-lock con { locked: false }, nada más', async () => {
    const product = createProduct({ id: 'prod-1', price_locked: true })
    mockedApiPatch.mockResolvedValue({ product: { ...product, price_locked: false } })

    render(<ExternalCatalogTable products={[product]} />)

    const button = screen.getByRole('button', { name: 'Destrabar precio' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockedApiPatch).toHaveBeenCalledWith(
        '/api/v1/admin/products/prod-1/price-lock',
        { locked: false },
      )
    })
  })

  it('cuando el PATCH de unlock resuelve, el PriceLockBadge desaparece de esa fila', async () => {
    const product = createProduct({ id: 'prod-1', name: 'Producto a destrabar', price_locked: true, sku: 'OLD-SKU' })
    // Mock returns a different SKU to prove component uses API response, not local guess
    mockedApiPatch.mockResolvedValue({ product: { ...product, price_locked: false, sku: 'NEW-SKU-UNLOCKED' } })

    render(<ExternalCatalogTable products={[product]} />)

    const button = screen.getByRole('button', { name: 'Destrabar precio' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Destrabar precio' })).not.toBeInTheDocument()
      // Assert that the component uses the API response, not a local guess
      expect(screen.getByText('NEW-SKU-UNLOCKED')).toBeInTheDocument()
    })
  })

  it('cuando el PATCH de unlock rechaza, el badge sigue mostrando locked (no cambia optimísticamente)', async () => {
    const product = createProduct({ id: 'prod-1', name: 'Producto que falla', price_locked: true })
    mockedApiPatch.mockRejectedValue(new Error('network error'))

    render(<ExternalCatalogTable products={[product]} />)

    const button = screen.getByRole('button', { name: 'Destrabar precio' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/no se pudo destrabar/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Destrabar precio' })).toBeInTheDocument()
  })

  it('click en la celda de categoría de una fila muestra un input con el valor actual', () => {
    const product = createProduct({ id: 'prod-1', category: 'Almohadones' })

    render(<ExternalCatalogTable products={[product]} />)

    fireEvent.click(screen.getByText('Almohadones'))

    const input = screen.getByLabelText('Categoría de producto prod-1') as HTMLInputElement
    expect(input.value).toBe('Almohadones')
  })

  it('cambiar el valor de categoría y blur dispara PATCH a external-categories con el nuevo display_name', async () => {
    const product = createProduct({
      id: 'prod-1',
      category: 'Almohadones',
      external_category_id: 'cat-1',
    })
    mockedApiPatch.mockResolvedValue({
      category: { id: 'cat-1', display_name: 'Almohadones Premium' },
      productsUpdated: 1,
    })

    render(<ExternalCatalogTable products={[product]} />)

    fireEvent.click(screen.getByText('Almohadones'))
    const input = screen.getByLabelText('Categoría de producto prod-1')
    fireEvent.change(input, { target: { value: 'Almohadones Premium' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockedApiPatch).toHaveBeenCalledWith(
        '/api/v1/admin/external-categories/cat-1',
        { display_name: 'Almohadones Premium' },
      )
    })
  })

  it('blur sin cambiar el valor de categoría no dispara PATCH', async () => {
    const product = createProduct({
      id: 'prod-1',
      category: 'Almohadones',
      external_category_id: 'cat-1',
    })

    render(<ExternalCatalogTable products={[product]} />)

    fireEvent.click(screen.getByText('Almohadones'))
    const input = screen.getByLabelText('Categoría de producto prod-1')
    fireEvent.blur(input)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockedApiPatch).not.toHaveBeenCalled()
  })

  it('renombrar la categoría de un producto propaga el nuevo nombre a todas las filas con el mismo external_category_id', async () => {
    const productA = createProduct({
      id: 'prod-1',
      name: 'Almohadón A',
      category: 'Almohadones',
      external_category_id: 'cat-1',
    })
    const productB = createProduct({
      id: 'prod-2',
      name: 'Almohadón B',
      category: 'Almohadones',
      external_category_id: 'cat-1',
    })
    mockedApiPatch.mockResolvedValue({
      category: { id: 'cat-1', display_name: 'Almohadones Premium' },
      productsUpdated: 2,
    })

    render(<ExternalCatalogTable products={[productA, productB]} />)

    const rowA = screen.getByText('Almohadón A').closest('tr') as HTMLElement
    fireEvent.click(within(rowA).getByText('Almohadones'))

    const input = screen.getByLabelText('Categoría de producto prod-1')
    fireEvent.change(input, { target: { value: 'Almohadones Premium' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(screen.getAllByText('Almohadones Premium')).toHaveLength(2)
    })
  })

  it('cuando el PATCH de categoría rechaza, la celda vuelve a mostrar el valor original y muestra un error', async () => {
    const product = createProduct({
      id: 'prod-1',
      category: 'Almohadones',
      external_category_id: 'cat-1',
    })
    mockedApiPatch.mockRejectedValue(new Error('network error'))

    render(<ExternalCatalogTable products={[product]} />)

    fireEvent.click(screen.getByText('Almohadones'))
    const input = screen.getByLabelText('Categoría de producto prod-1')
    fireEvent.change(input, { target: { value: 'Otra categoría' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(screen.getByText(/no se pudo guardar la categoría/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Almohadones')).toBeInTheDocument()
  })
})
