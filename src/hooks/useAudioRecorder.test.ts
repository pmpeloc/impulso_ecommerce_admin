import { renderHook, act } from '@testing-library/react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

// Capture the recorder instance created by the hook so we can trigger events
let capturedRecorder: {
  ondataavailable: ((e: { data: Blob }) => void) | null
  onstop: (() => void) | null
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  state: string
} | null = null

class MockMediaRecorder {
  static isTypeSupported = vi.fn((type: string) => type === 'audio/webm')
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  state = 'inactive'
  start = vi.fn(() => { this.state = 'recording' })
  stop = vi.fn(() => { this.state = 'inactive' })

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    capturedRecorder = this
  }
}

const mockGetUserMedia = vi.fn()
const mockTrackStop = vi.fn()

describe('useAudioRecorder', () => {
  beforeEach(() => {
    capturedRecorder = null
    mockGetUserMedia.mockReset()
    mockGetUserMedia.mockResolvedValue({ getTracks: () => [{ stop: mockTrackStop }] })
    MockMediaRecorder.isTypeSupported.mockImplementation((type: string) => type === 'audio/webm')
    vi.stubGlobal('MediaRecorder', MockMediaRecorder)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:audio-preview-url'),
      revokeObjectURL: vi.fn(),
    })
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
      configurable: true,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('inicia en estado idle con seconds=0 y sin audioUrl', () => {
    const { result } = renderHook(() => useAudioRecorder())
    expect(result.current.state).toBe('idle')
    expect(result.current.seconds).toBe(0)
    expect(result.current.audioUrl).toBeNull()
    expect(result.current.blob).toBeNull()
  })

  it('startRecording cambia estado a "recording"', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => { await result.current.startRecording() })

    expect(result.current.state).toBe('recording')
  })

  it('el timer incrementa seconds cada segundo durante la grabación', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => { await result.current.startRecording() })
    act(() => { vi.advanceTimersByTime(3000) })

    expect(result.current.seconds).toBe(3)
  })

  it('stopRecording → onstop → estado "recorded" con audioUrl y blob', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => { await result.current.startRecording() })
    act(() => { result.current.stopRecording() })
    act(() => {
      capturedRecorder!.ondataavailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) })
      capturedRecorder!.onstop?.()
    })

    expect(result.current.state).toBe('recorded')
    expect(result.current.audioUrl).toBe('blob:audio-preview-url')
    expect(result.current.blob).toBeInstanceOf(Blob)
  })

  it('stopRecording detiene el timer', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => { await result.current.startRecording() })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { result.current.stopRecording() })
    act(() => {
      capturedRecorder!.ondataavailable?.({ data: new Blob(['audio']) })
      capturedRecorder!.onstop?.()
    })
    act(() => { vi.advanceTimersByTime(5000) })

    expect(result.current.seconds).toBe(2)
  })

  it('discard vuelve a idle y limpia blob y audioUrl', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => { await result.current.startRecording() })
    act(() => { result.current.stopRecording() })
    act(() => {
      capturedRecorder!.ondataavailable?.({ data: new Blob(['audio']) })
      capturedRecorder!.onstop?.()
    })
    act(() => { result.current.discard() })

    expect(result.current.state).toBe('idle')
    expect(result.current.audioUrl).toBeNull()
    expect(result.current.blob).toBeNull()
  })

  it('detecta audio/webm cuando es soportado', () => {
    MockMediaRecorder.isTypeSupported.mockImplementation((t: string) => t === 'audio/webm')
    const { result } = renderHook(() => useAudioRecorder())
    expect(result.current.mimeType).toBe('audio/webm')
  })

  it('detecta audio/mp4 cuando webm no es soportado', () => {
    MockMediaRecorder.isTypeSupported.mockImplementation((t: string) => t === 'audio/mp4')
    const { result } = renderHook(() => useAudioRecorder())
    expect(result.current.mimeType).toBe('audio/mp4')
  })
})
