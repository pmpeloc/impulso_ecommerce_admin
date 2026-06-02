import { useRef } from 'react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  previewUrl?: string | null
}

export function CameraCapture({ onCapture, previewUrl }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onCapture(file)
    // Reset value so the same file can be re-selected after retake
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Foto capturada"
          className="w-full max-w-sm aspect-square object-cover rounded-2xl shadow-md"
        />
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full max-w-sm py-4 bg-black text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 active:bg-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {previewUrl ? 'Retomar foto' : 'Tomar foto'}
      </button>
    </div>
  )
}
