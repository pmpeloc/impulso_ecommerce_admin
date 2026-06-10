import { Button } from '@/components/ui/Button'

interface ImagePreviewProps {
  previewUrl: string
  onRetake: () => void
  onConfirm: () => void
}

export function ImagePreview({ previewUrl, onRetake, onConfirm }: ImagePreviewProps) {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-0">
      <img
        src={previewUrl}
        alt="Vista previa del producto"
        className="aspect-square w-full rounded-[20px] border border-border object-cover shadow-panel"
      />
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button onClick={onConfirm}>Continuar</Button>
        <Button variant="secondary" onClick={onRetake}>Retomar foto</Button>
      </div>
    </div>
  )
}
