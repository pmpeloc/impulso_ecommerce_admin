'use client'

import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { Button } from '@/components/ui/Button'

interface AudioRecorderProps {
  onRecorded: (blob: Blob, mimeType: string) => void
}

function formatTime(s: number): string {
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioRecorder({ onRecorded }: AudioRecorderProps) {
  const { state, seconds, audioUrl, blob, mimeType, startRecording, stopRecording, discard } =
    useAudioRecorder()

  if (state === 'recording') {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="text-2xl font-mono font-semibold tabular-nums">
            {formatTime(seconds)}
          </span>
        </div>
        <Button onClick={stopRecording} variant="secondary" className="w-full max-w-xs">
          Detener
        </Button>
      </div>
    )
  }

  if (state === 'recorded' && audioUrl) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <audio src={audioUrl} controls className="w-full" />
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => { if (blob) onRecorded(blob, mimeType) }}
          >
            Usar grabación
          </Button>
          <Button variant="secondary" onClick={discard}>
            Descartar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Button onClick={startRecording} variant="secondary" className="w-full">
        <span className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
          Grabar descripción
        </span>
      </Button>
    </div>
  )
}
