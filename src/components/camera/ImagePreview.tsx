import { Button } from '@/components/ui/Button'

interface ImagePreviewProps {
  previewUrl: string
  onRetake: () => void
  onConfirm: () => void
}

export function ImagePreview({ previewUrl, onRetake, onConfirm }: ImagePreviewProps) {
  return (
    <div className="flex flex-col gap-5 p-4">
      <img
        src={previewUrl}
        alt="Vista previa del producto"
        className="w-full aspect-square object-cover rounded-2xl shadow-md"
      />
      <div className="flex flex-col gap-3">
        <Button onClick={onConfirm}>Continuar</Button>
        <Button variant="secondary" onClick={onRetake}>Retomar foto</Button>
      </div>
    </div>
  )
}
