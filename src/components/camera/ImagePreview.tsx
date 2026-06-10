import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface ImagePreviewProps {
  previewUrl: string
  onRetake: () => void
  onConfirm: () => void
}

export function ImagePreview({ previewUrl, onRetake, onConfirm }: ImagePreviewProps) {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-0">
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] border border-border shadow-panel">
        <Image
          src={previewUrl}
          alt="Vista previa del producto"
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button onClick={onConfirm}>Continuar</Button>
        <Button variant="secondary" onClick={onRetake}>Retomar foto</Button>
      </div>
    </div>
  )
}
