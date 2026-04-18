'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

interface Props {
  form: UseFormReturn<WizardSchema>
}

type ImageEntry = { url: string; position: number; isCover: boolean; localFile?: File }

export function Step5Images({ form }: Props) {
  const { watch, setValue } = form
  const images: ImageEntry[] = watch('images') ?? []
  const [dragging, setDragging] = useState(false)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const fileArr = Array.from(files)
    const previews: ImageEntry[] = fileArr.map((file, i) => ({
      url: URL.createObjectURL(file),
      position: images.length + i,
      isCover: images.length + i === 0,
      localFile: file,
    }))
    const next = [...images, ...previews].map((img, i) => ({ ...img, position: i, isCover: i === 0 }))
    setValue('images', next)
  }

  function remove(idx: number) {
    const next = images.filter((_, i) => i !== idx).map((img, i) => ({ ...img, position: i, isCover: i === 0 }))
    setValue('images', next)
  }

  function setCover(idx: number) {
    const next = images.map((img, i) => ({ ...img, isCover: i === idx }))
    setValue('images', next)
  }

  // Drag-to-reorder between cards
  const dragIdx = useRef<number | null>(null)

  function handleDragStart(idx: number) { dragIdx.current = idx }
  function handleDragEnterCard(idx: number) { setDragOver(idx) }
  function handleDropCard(idx: number) {
    if (dragIdx.current === null || dragIdx.current === idx) return
    const next = [...images]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(idx, 0, moved)
    setValue('images', next.map((img, i) => ({ ...img, position: i, isCover: i === 0 })))
    dragIdx.current = null
    setDragOver(null)
  }

  const onDropZone = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [images]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDropZone}
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
        style={{
          borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
          background:  dragging ? 'oklch(42% 0.09 155 / 0.05)' : 'var(--color-bg)',
        }}
      >
        <span className="text-3xl leading-none">📸</span>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Glissez vos photos ici
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            ou cliquez pour sélectionner · JPG, PNG, WebP
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files) }}
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnterCard(idx)}
              onDrop={() => handleDropCard(idx)}
              onDragOver={(e) => e.preventDefault()}
              className="relative rounded-xl overflow-hidden aspect-square group cursor-grab transition-opacity"
              style={{ opacity: dragOver === idx ? 0.5 : 1 }}
            >
              <Image src={img.url} alt={`Photo ${idx + 1}`} fill sizes="120px" className="object-cover" />

              {/* Cover badge */}
              {img.isCover && (
                <span className="absolute top-1.5 left-1.5 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--color-primary)' }}>
                  Couverture
                </span>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 flex flex-col items-end justify-between p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.35)' }}>
                <button type="button" onClick={() => remove(idx)} aria-label="Supprimer"
                  className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold"
                  style={{ color: 'oklch(45% 0.18 25)' }}>
                  ✕
                </button>
                {!img.isCover && (
                  <button type="button" onClick={() => setCover(idx)}
                    className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full bg-white/90"
                    style={{ color: 'var(--color-primary)' }}>
                    Couverture
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add more */}
          <button type="button" onClick={() => inputRef.current?.click()}
            className="rounded-xl border-2 border-dashed aspect-square flex items-center justify-center text-2xl transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
            +
          </button>
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
        La première photo sera la photo de couverture. Faites glisser pour réorganiser.
      </p>
    </div>
  )
}
