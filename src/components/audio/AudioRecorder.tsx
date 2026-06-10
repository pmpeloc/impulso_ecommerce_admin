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
      <div className="flex flex-col gap-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
        <div className="flex items-center justify-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ai" aria-hidden="true" />
          <span className="font-mono text-xl font-semibold tabular-nums text-[#EDEDF0]">
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
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <audio src={audioUrl} controls className="w-full accent-brand" />
        <div className="flex flex-col gap-2 sm:flex-row">
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
    <div className="rounded-xl border border-border bg-surface p-3">
      <Button onClick={startRecording} variant="secondary" className="w-full">
        <span className="flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
          Grabar descripción
        </span>
      </Button>
    </div>
  )
}
