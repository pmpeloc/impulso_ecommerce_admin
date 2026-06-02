import { useState, useRef, useCallback, useEffect } from 'react'

export type RecorderState = 'idle' | 'recording' | 'recorded'

export interface UseAudioRecorderReturn {
  state: RecorderState
  seconds: number
  audioUrl: string | null
  blob: Blob | null
  mimeType: string
  startRecording: () => Promise<void>
  stopRecording: () => void
  discard: () => void
}

function detectMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  return ''
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [mimeType] = useState(() => detectMimeType())

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const options = mimeType ? { mimeType } : undefined
      const recorder = new MediaRecorder(stream, options)
      recorderRef.current = recorder

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const url = URL.createObjectURL(recorded)
        setBlob(recorded)
        setAudioUrl(url)
        setState('recorded')
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setState('idle')
    }
  }, [mimeType])

  const stopRecording = useCallback(() => {
    stopTimer()
    recorderRef.current?.stop()
  }, [stopTimer])

  const discard = useCallback(() => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setBlob(null)
    chunksRef.current = []
    setSeconds(0)
    setState('idle')
  }, [])

  useEffect(() => {
    return () => {
      stopTimer()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [stopTimer])

  return { state, seconds, audioUrl, blob, mimeType, startRecording, stopRecording, discard }
}
