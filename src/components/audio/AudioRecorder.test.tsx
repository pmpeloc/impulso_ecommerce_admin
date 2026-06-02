import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioRecorder } from '@/components/audio/AudioRecorder'

const mockUseAudioRecorder = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAudioRecorder', () => ({
  useAudioRecorder: mockUseAudioRecorder,
}))

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const baseState = {
  state: 'idle' as const,
  seconds: 0,
  audioUrl: null,
  blob: null,
  mimeType: 'audio/webm',
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  discard: vi.fn(),
}

describe('AudioRecorder', () => {
  beforeEach(() => {
    mockUseAudioRecorder.mockReturnValue({ ...baseState })
  })

  it('muestra botón "Grabar" en estado idle', () => {
    render(<AudioRecorder onRecorded={vi.fn()} />)
    expect(screen.getByRole('button', { name: /grabar/i })).toBeInTheDocument()
  })

  it('en estado "recording" muestra el timer y botón "Detener"', () => {
    mockUseAudioRecorder.mockReturnValue({ ...baseState, state: 'recording', seconds: 5 })
    render(<AudioRecorder onRecorded={vi.fn()} />)

    expect(screen.getByRole('button', { name: /detener/i })).toBeInTheDocument()
    expect(screen.getByText(formatTime(5))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /grabar/i })).not.toBeInTheDocument()
  })

  it('en estado "recorded" muestra audio player, botón Usar y Descartar', () => {
    mockUseAudioRecorder.mockReturnValue({
      ...baseState,
      state: 'recorded',
      audioUrl: 'blob:audio-url',
      blob: new Blob(['audio']),
    })
    render(<AudioRecorder onRecorded={vi.fn()} />)

    expect(document.querySelector('audio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /usar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /descartar/i })).toBeInTheDocument()
  })

  it('clic en Grabar llama a startRecording()', async () => {
    const startRecording = vi.fn()
    mockUseAudioRecorder.mockReturnValue({ ...baseState, startRecording })
    const user = userEvent.setup()
    render(<AudioRecorder onRecorded={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /grabar/i }))

    expect(startRecording).toHaveBeenCalledTimes(1)
  })

  it('clic en Detener llama a stopRecording()', async () => {
    const stopRecording = vi.fn()
    mockUseAudioRecorder.mockReturnValue({ ...baseState, state: 'recording', seconds: 3, stopRecording })
    const user = userEvent.setup()
    render(<AudioRecorder onRecorded={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /detener/i }))

    expect(stopRecording).toHaveBeenCalledTimes(1)
  })

  it('clic en Usar llama a onRecorded(blob, mimeType)', async () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' })
    const onRecorded = vi.fn()
    mockUseAudioRecorder.mockReturnValue({
      ...baseState,
      state: 'recorded',
      audioUrl: 'blob:audio-url',
      blob,
      mimeType: 'audio/webm',
    })
    const user = userEvent.setup()
    render(<AudioRecorder onRecorded={onRecorded} />)

    await user.click(screen.getByRole('button', { name: /usar/i }))

    expect(onRecorded).toHaveBeenCalledWith(blob, 'audio/webm')
  })

  it('clic en Descartar llama a discard()', async () => {
    const discard = vi.fn()
    mockUseAudioRecorder.mockReturnValue({
      ...baseState,
      state: 'recorded',
      audioUrl: 'blob:audio-url',
      blob: new Blob(['audio']),
      discard,
    })
    const user = userEvent.setup()
    render(<AudioRecorder onRecorded={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /descartar/i }))

    expect(discard).toHaveBeenCalledTimes(1)
  })
})
