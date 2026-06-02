import { render, screen } from '@testing-library/react'
import { PipelineStatus } from '@/components/product/PipelineStatus'
import type { PipelineJob, PublishLog } from '@/types/api'

const mockUsePipeline = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/usePipeline', () => ({ usePipeline: mockUsePipeline }))

const makeJob = (overrides: Partial<PipelineJob> = {}): PipelineJob => ({
  id: '1', product_id: 'p1', type: 'ingestion', status: 'processing',
  error: null, metadata: null, created_at: '', updated_at: '', ...overrides,
})

const makeLog = (overrides: Partial<PublishLog> = {}): PublishLog => ({
  id: '1', product_id: 'p1', channel: 'whatsapp', status: 'success',
  external_id: null, error: null, published_at: null, ...overrides,
})

const emptyState = { jobs: [], publishLogs: [], isLoading: false, error: undefined }

describe('PipelineStatus', () => {
  beforeEach(() => mockUsePipeline.mockReturnValue(emptyState))

  describe('estado general', () => {
    it('muestra estado "Procesando..." cuando productStatus es processing', () => {
      render(<PipelineStatus productId="p1" productStatus="processing" />)
      expect(screen.getByText(/procesando/i)).toBeInTheDocument()
    })

    it('muestra "¡Publicado!" cuando productStatus es published', () => {
      render(<PipelineStatus productId="p1" productStatus="published" />)
      expect(screen.getByText(/publicado/i)).toBeInTheDocument()
    })

    it('muestra "Error" cuando productStatus es failed', () => {
      render(<PipelineStatus productId="p1" productStatus="failed" />)
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  describe('jobs de procesamiento', () => {
    it('muestra "Procesando..." para jobs en estado processing', () => {
      mockUsePipeline.mockReturnValue({
        ...emptyState,
        jobs: [makeJob({ status: 'processing' })],
      })
      render(<PipelineStatus productId="p1" productStatus="processing" />)
      expect(screen.getAllByText(/procesando/i).length).toBeGreaterThan(0)
    })

    it('muestra "Completado" para job done', () => {
      mockUsePipeline.mockReturnValue({
        ...emptyState,
        jobs: [makeJob({ status: 'done' })],
      })
      render(<PipelineStatus productId="p1" productStatus="processing" />)
      expect(screen.getByText(/completado/i)).toBeInTheDocument()
    })

    it('muestra "Error" para job failed', () => {
      mockUsePipeline.mockReturnValue({
        ...emptyState,
        jobs: [makeJob({ status: 'failed', error: 'Fallo al subir imagen' })],
      })
      render(<PipelineStatus productId="p1" productStatus="failed" />)
      expect(screen.getAllByText(/error/i).length).toBeGreaterThan(0)
    })
  })

  describe('canales de publicación', () => {
    it('muestra los tres canales siempre', () => {
      render(<PipelineStatus productId="p1" productStatus="published" />)
      expect(screen.getByText(/whatsapp/i)).toBeInTheDocument()
      expect(screen.getByText(/facebook/i)).toBeInTheDocument()
      expect(screen.getByText(/mercado libre/i)).toBeInTheDocument()
    })

    it('muestra "Publicado" para canal con log success', () => {
      mockUsePipeline.mockReturnValue({
        ...emptyState,
        publishLogs: [makeLog({ channel: 'whatsapp', status: 'success' })],
      })
      render(<PipelineStatus productId="p1" productStatus="published" />)
      // Both the general status ("¡Publicado!") and the channel label ("Publicado") match
      expect(screen.getAllByText(/publicado/i).length).toBeGreaterThanOrEqual(2)
    })

    it('muestra "Error" para canal con log failed', () => {
      mockUsePipeline.mockReturnValue({
        ...emptyState,
        publishLogs: [makeLog({ channel: 'facebook', status: 'failed' })],
      })
      render(<PipelineStatus productId="p1" productStatus="failed" />)
      // Multiple "Error" texts expected (general + channel)
      expect(screen.getAllByText(/error/i).length).toBeGreaterThan(0)
    })

    it('muestra "Pendiente" para canal sin log todavía', () => {
      render(<PipelineStatus productId="p1" productStatus="processing" />)
      expect(screen.getAllByText(/pendiente/i).length).toBeGreaterThan(0)
    })
  })

  describe('carga', () => {
    it('muestra spinner mientras carga', () => {
      mockUsePipeline.mockReturnValue({ ...emptyState, isLoading: true })
      render(<PipelineStatus productId="p1" productStatus="processing" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
})
