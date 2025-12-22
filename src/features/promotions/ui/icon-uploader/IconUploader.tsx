import { useCallback, useRef, useState } from 'react'
import { X, Upload, ImageIcon } from 'lucide-react'
import styles from './styles.module.scss'

interface IconUploaderProps {
  existingIconUrl: string | null
  newIcon: File | null
  onIconChange: (file: File | null) => void
  onRemoveExisting: () => void
}

export function IconUploader({
  existingIconUrl,
  newIcon,
  onIconChange,
  onRemoveExisting,
}: IconUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const hasImage = existingIconUrl || newIcon

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type.startsWith('image/')) {
        onIconChange(file)
      }
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [onIconChange]
  )

  const handleRemove = useCallback(() => {
    if (newIcon) {
      onIconChange(null)
    } else if (existingIconUrl) {
      onRemoveExisting()
    }
  }, [newIcon, existingIconUrl, onIconChange, onRemoveExisting])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        onIconChange(file)
      }
    },
    [onIconChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const getImageSrc = () => {
    if (newIcon) {
      return URL.createObjectURL(newIcon)
    }
    return existingIconUrl
  }

  return (
    <div className={styles.container}>
      {hasImage ? (
        <div className={styles.preview}>
          <img src={getImageSrc() ?? undefined} alt="아이콘 미리보기" />
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemove}
            aria-label="아이콘 삭제"
          >
            <X className="size-4" />
          </button>
          {newIcon && <span className={styles.newBadge}>NEW</span>}
          <button
            type="button"
            className={styles.changeButton}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            변경
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              inputRef.current?.click()
            }
          }}
        >
          <ImageIcon className="size-10 text-muted-foreground" />
          <p className={styles.dropZoneText}>
            아이콘 이미지를 드래그하거나 클릭하여 선택
          </p>
          <p className={styles.dropZoneHint}>PNG, JPG (112x112px 권장)</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileSelect}
      />
    </div>
  )
}
