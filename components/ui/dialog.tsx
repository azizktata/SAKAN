'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

export function Dialog({ open, onClose, children, maxWidth = 'max-w-lg' }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open || typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop — clicking it closes the dialog */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content wrapper — pointer-events-none so clicks outside the box hit the backdrop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className={`w-full ${maxWidth} max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl pointer-events-auto`}
          style={{ background: 'var(--color-surface)' }}
        >
          {children}
        </div>
      </div>
    </>,
    document.body,
  )
}
