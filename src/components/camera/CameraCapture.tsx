import { useRef } from 'react'
import Image from 'next/image'

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
    <div className="flex flex-col items-center gap-4 p-4 md:items-start md:p-0">
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
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-border shadow-panel">
          <Image
            src={previewUrl}
            alt="Foto capturada"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${previewUrl ? 'border-solid' : 'border-dashed'} flex h-40 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-[20px] border border-border-strong bg-surface text-sm font-semibold text-[#A1A1AC] transition hover:border-indigo-500/40 hover:bg-surface-raised hover:text-[#EDEDF0] md:h-52`}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-indigo-500/10 text-brand">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        </span>
        {previewUrl ? 'Retomar foto' : 'Tomar foto'}
        {!previewUrl && <span className="text-xs font-normal text-[#6B6B76]">JPG o PNG, hasta 10 MB</span>}
      </button>
    </div>
  )
}
