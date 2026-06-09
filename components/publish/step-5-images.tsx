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
        className="border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
        style={{
          borderRadius: '3px',
          borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
          background:  dragging ? 'oklch(42% 0.09 155 / 0.05)' : 'var(--color-surface)',
        }}
      >
        <div
          className="w-12 h-12 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--color-bg)', color: 'var(--color-primary)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
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
              className="relative overflow-hidden aspect-square group cursor-grab transition-opacity"
              style={{ borderRadius: '3px', opacity: dragOver === idx ? 0.5 : 1 }}
            >
              <Image src={img.url} alt={`Photo ${idx + 1}`} fill sizes="120px" className="object-cover" />

              {img.isCover && (
                <span
                  className="absolute top-1.5 left-1.5 text-[0.6rem] font-bold px-1.5 py-0.5 text-white"
                  style={{ background: 'var(--color-primary)', borderRadius: '3px' }}
                >
                  Couverture
                </span>
              )}

              <div className="absolute inset-0 flex flex-col items-end justify-between p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.35)' }}>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label="Supprimer"
                  className="w-6 h-6 bg-white/90 flex items-center justify-center"
                  style={{ borderRadius: '3px', color: 'oklch(45% 0.18 25)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {!img.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(idx)}
                    className="text-[0.6rem] font-semibold px-1.5 py-0.5 bg-white/90"
                    style={{ borderRadius: '3px', color: 'var(--color-primary)' }}
                  >
                    Couverture
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add more */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ borderRadius: '3px', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-[10px] font-semibold">Ajouter</span>
          </button>
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
        La première photo sera la photo de couverture. Faites glisser pour réorganiser.
      </p>
    </div>
  )
}
