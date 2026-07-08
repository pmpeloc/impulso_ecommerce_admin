import { render, screen, within } from '@testing-library/react'
import { ExternalCatalogTable } from '@/components/product/ExternalCatalogTable'
import type { Product } from '@/types/product'

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
})
