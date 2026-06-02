import { useState, useCallback } from 'react'

interface UseCameraReturn {
  file: File | null
  previewUrl: string | null
  onFileChange: (file: File) => void
  reset: () => void
}

export function useCamera(): UseCameraReturn {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const onFileChange = useCallback((newFile: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(newFile)
    })
    setFile(newFile)
  }, [])

  const reset = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setFile(null)
  }, [])

  return { file, previewUrl, onFileChange, reset }
}
