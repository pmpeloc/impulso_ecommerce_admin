import { renderHook } from '@testing-library/react'
import { useTenantConfig } from '@/hooks/useTenantConfig'

const mockUseSWR = vi.hoisted(() => vi.fn())

vi.mock('swr', () => ({ default: mockUseSWR }))

describe('useTenantConfig', () => {
  beforeEach(() => mockUseSWR.mockReset())

  it('llama a SWR con la URL correcta', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })

    renderHook(() => useTenantConfig())

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/v1/admin/tenant-config',
      expect.any(Function),
    )
  })

  it('retorna tenantConfig del data cuando SWR resuelve con datos', () => {
    const tenantConfig = {
      id: '1',
      tenant_id: 'tenant-1',
      client_name: 'Renuevo Almohadones',
      brand_color: '#6366F1',
      logo_url: null,
      favicon_url: null,
      email_from: null,
      whatsapp_number: null,
      whatsapp_message: null,
      meta_catalog_id: null,
      meta_access_token: null,
      meta_page_id: null,
      product_source_mode: 'own' as const,
      markup_retail_pct: null,
      markup_wholesale_pct: null,
      checkout_methods: ['mobbex'],
      external_connector_config: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    mockUseSWR.mockReturnValue({ data: { tenantConfig }, error: undefined, isLoading: false })

    const { result } = renderHook(() => useTenantConfig())

    expect(result.current.tenantConfig).toEqual(tenantConfig)
    expect(result.current.isLoading).toBe(false)
  })

  it('retorna tenantConfig como undefined mientras data es undefined', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })

    const { result } = renderHook(() => useTenantConfig())

    expect(result.current.tenantConfig).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
  })

  it('expone el error de SWR', () => {
    const error = new Error('Network error')
    mockUseSWR.mockReturnValue({ data: undefined, error, isLoading: false })

    const { result } = renderHook(() => useTenantConfig())

    expect(result.current.error).toBe(error)
  })
})
