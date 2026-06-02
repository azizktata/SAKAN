'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Property, ViewSource } from '@/lib/api'
import { propertiesApi, analyticsApi, sessionApi } from '@/lib/api'
import { getVisitorKey, setVisitorKey } from '@/lib/visitor'
import { getSessionToken, setSessionToken } from '@/lib/session'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  )
}
function IconPin() {
  return (
    <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconPhone() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}
function IconWhatsApp() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
function IconShare() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}
function IconX() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
function IconArrowLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}
function IconMessage() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ images, title, startIdx, onClose }: {
  images: string[]
  title: string
  startIdx: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIdx)
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.96)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-sans)' }}>
          {idx + 1} / {images.length}
        </span>
        <button onClick={onClose} aria-label="Fermer"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <IconX />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[idx]} alt={`${title} — photo ${idx + 1}`}
          className="max-h-full max-w-full object-contain select-none"
          style={{ maxHeight: 'calc(100vh - 140px)' }} />
        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Photo précédente"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <IconChevronLeft />
            </button>
            <button onClick={next} aria-label="Photo suivante"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <IconChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="shrink-0 px-4 pb-4 pt-2 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="shrink-0 overflow-hidden transition-opacity"
              style={{ width: '60px', height: '44px', borderRadius: '8px', opacity: i === idx ? 1 : 0.45, outline: i === idx ? '2px solid var(--color-accent)' : 'none', outlineOffset: '1px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Gallery — desktop mosaic + mobile carousel ────────────────────────────────

function GalleryHero({ images, title }: { images: string[]; title: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  // Mobile carousel state
  const [mobileIdx, setMobileIdx] = useState(0)
  const prevMobile = useCallback(() => setMobileIdx((i) => (i - 1 + images.length) % images.length), [images.length])
  const nextMobile = useCallback(() => setMobileIdx((i) => (i + 1) % images.length), [images.length])

  function openLightbox(i: number) {
    setLightboxIdx(i)
    setLightboxOpen(true)
  }

  if (images.length === 0) {
    return <div className="w-full" style={{ height: '420px', background: 'var(--color-surface-warm)' }} />
  }

  return (
    <>
      {/* ── Desktop mosaic ── */}
      <div className="hidden md:block relative rounded-2xl overflow-hidden" style={{ height: '520px' }}>
        <div className="grid h-full gap-1" style={{ gridTemplateColumns: '60% 1fr 1fr', gridTemplateRows: '1fr 1fr' }}>

          {/* Cover — spans 2 rows */}
          <button
            className="row-span-2 relative overflow-hidden group"
            onClick={() => openLightbox(0)}
            aria-label="Ouvrir la galerie photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          </button>

          {/* Secondary images — 2×2 right */}
          {[1, 2, 3, 4].map((i) => (
            images[i] ? (
              <button key={i}
                className="relative overflow-hidden group"
                onClick={() => openLightbox(i)}
                aria-label={`Photo ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[i]} alt={`${title} — ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                {/* Darken last cell if more images hidden */}
                {i === 4 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>
                      +{images.length - 5}
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <div key={i} style={{ background: 'var(--color-surface-deep)' }} />
            )
          ))}
        </div>

        {/* "Voir toutes les photos" button — bottom right of mosaic */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-surface)', borderRadius: '10px', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
          <IconGrid />
          Voir toutes les photos ({images.length})
        </button>
      </div>

      {/* ── Mobile carousel ── */}
      <div className="md:hidden relative overflow-hidden" style={{ height: 'clamp(260px, 56vw, 400px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[mobileIdx]} alt={`${title} — photo ${mobileIdx + 1}`}
          className="absolute inset-0 w-full h-full object-cover" onClick={() => openLightbox(mobileIdx)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {images.length > 1 && (
          <>
            <button onClick={prevMobile} aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              <IconChevronLeft />
            </button>
            <button onClick={nextMobile} aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              <IconChevronRight />
            </button>
          </>
        )}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4">
          <span className="text-xs font-medium text-white px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)', fontFamily: 'var(--font-sans)' }}>
            {mobileIdx + 1} / {images.length}
          </span>
          <button onClick={() => openLightbox(mobileIdx)}
            className="text-xs font-medium text-white px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)', fontFamily: 'var(--font-sans)' }}>
            Toutes les photos
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox images={images} title={title} startIdx={lightboxIdx} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}

// ── Contact panel ─────────────────────────────────────────────────────────────

function ContactPanel({ prop, onClose }: { prop: Property; onClose: () => void }) {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(false)
  const [copied,  setCopied]  = useState(false)
  const priceLabel = prop.transaction_type === 'rent' ? '/mois' : 'DT'

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      await propertiesApi.contact(prop.id, { name, phone: phone.trim(), message })
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      await navigator.share({ title: prop.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}>
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-start justify-between">
          <div>
            <p className="font-display font-bold tabular-nums" style={{ fontSize: '1.375rem', color: 'var(--color-text)' }}>
              {fmt(prop.price)}{' '}
              <span className="text-base font-normal" style={{ color: 'var(--color-muted)' }}>{priceLabel}</span>
            </p>
            <p className="text-xs truncate max-w-[22ch]" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
              {prop.title}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: 'var(--color-muted)' }}>
            <IconX />
          </button>
        </div>

        {sent ? (
          <div className="py-4 text-center rounded-xl" style={{ background: 'oklch(32% 0.08 130 / 0.07)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Message envoyé ✓</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
              Le propriétaire vous contactera bientôt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-2">
            <input type="text" placeholder="Votre nom *" value={name}
              onChange={(e) => setName(e.target.value)} required
              className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)', borderRadius: '4px', fontFamily: 'var(--font-sans)' }} />
            <input type="tel" placeholder="Téléphone *" value={phone}
              onChange={(e) => setPhone(e.target.value)} required
              className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)', borderRadius: '4px', fontFamily: 'var(--font-sans)' }} />
            <textarea placeholder="Votre message… *" value={message}
              onChange={(e) => setMessage(e.target.value)} required rows={3}
              className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)', borderRadius: '4px', fontFamily: 'var(--font-sans)' }} />
            {error && (
              <p className="text-xs text-center" style={{ color: 'oklch(55% 0.18 25)', fontFamily: 'var(--font-sans)' }}>
                Une erreur s&apos;est produite. Veuillez réessayer.
              </p>
            )}
            <button type="submit" disabled={sending}
              className="w-full py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--color-primary)', borderRadius: '4px', fontFamily: 'var(--font-sans)' }}>
              {sending ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>
        )}

        <button onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '4px', fontFamily: 'var(--font-sans)' }}>
          <IconShare />
          {copied ? 'Lien copié !' : 'Partager ce bien'}
        </button>
      </div>
    </div>
  )
}

// ── Similar card ──────────────────────────────────────────────────────────────

function SimilarCard({ prop }: { prop: Property }) {
  const priceLabel = prop.transaction_type === 'rent' ? '/mois' : 'DT'
  const cover      = prop.images?.find((i) => i.is_cover) ?? prop.images?.[0]
  const location   = prop.location?.name ?? prop.address ?? ''

  return (
    <Link href={`/logements/${prop.id}`}
      className="group rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="relative overflow-hidden" style={{ height: '170px' }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={prop.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--color-surface-warm)' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="p-4">
        <p className="font-display font-semibold text-sm leading-snug mb-1 line-clamp-2"
          style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
          {prop.title}
        </p>
        <p className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
          <IconPin />{location}
        </p>
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="font-display font-bold text-sm tabular-nums" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            {fmt(prop.price)}{' '}
            <span className="font-normal text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>{priceLabel}</span>
          </p>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
            {prop.surface ? `${prop.surface} m²` : ''}{prop.bedrooms ? ` · ${prop.bedrooms} ch.` : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PropertyDetailClient({ prop, similar }: { prop: Property; similar: Property[] }) {
  const [contactOpen, setContactOpen] = useState(false)
  const searchParams = useSearchParams()
  const trackedRef   = useRef(false)
  const viewIdRef    = useRef<string | undefined>(undefined)
  const mountTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true

    const source: ViewSource = searchParams.get('ref') === 'listing'
      ? 'listing'
      : searchParams.get('ref') === 'map'
      ? 'map'
      : 'direct'

    analyticsApi.trackView({
      property_id: prop.id,
      visitor_key: getVisitorKey(),
      source,
    }).then(res => {
      if (res.data.visitor_key) setVisitorKey(res.data.visitor_key)
      if (res.data.view_id) viewIdRef.current = res.data.view_id

      if (!getSessionToken() && res.data.visitor_key) {
        const ua = navigator.userAgent
        const device: 'mobile' | 'desktop' | 'tablet' | 'unknown' =
          /tablet|ipad/i.test(ua) ? 'tablet' :
          /mobile|iphone|android/i.test(ua) ? 'mobile' :
          /windows|mac|linux/i.test(ua) ? 'desktop' : 'unknown'
        sessionApi.start({
          visitor_key: res.data.visitor_key,
          entry_page: window.location.pathname,
          device,
        }).then(s => { if (s.data.session_token) setSessionToken(s.data.session_token) })
          .catch(() => {})
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prop.id])

  useEffect(() => {
    const sendDuration = () => {
      const viewId = viewIdRef.current
      if (!viewId) return
      const elapsed = Math.round((Date.now() - mountTimeRef.current) / 1000)
      if (elapsed < 2) return
      analyticsApi.updateDuration(viewId, elapsed).catch(() => {})
    }
    const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') sendDuration() }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', sendDuration)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', sendDuration)
    }
  }, [])

  const images      = prop.images?.sort((a, b) => (a.is_cover ? -1 : b.is_cover ? 1 : a.position - b.position)).map((i) => i.url) ?? []
  const location    = prop.location?.name ?? prop.address ?? ''
  const typeLabel   = PROPERTY_TYPE_LABELS[prop.property_type] ?? prop.property_type
  const priceLabel  = prop.transaction_type === 'rent' ? 'DT / mois' : 'DT'
  const ownerPhone  = prop.user?.phone ?? null
  const descPhone   = prop.description
    ? (prop.description.match(/(?:\+216\s?)?(?:2|5|9)\d[\s.]?\d{3}[\s.]?\d{3}/)?.[0]?.replace(/\s|\./g, '') ?? null)
    : null
  const contactPhone = ownerPhone ?? descPhone

  // Spec strip items — only non-null
  const specs = [
    prop.surface   != null && { label: 'Superficie',  value: `${prop.surface} m²` },
    prop.bedrooms  != null && { label: 'Chambres',     value: String(prop.bedrooms) },
    prop.bathrooms != null && { label: 'Salles de bain', value: String(prop.bathrooms) },
    prop.floor     != null && prop.floor > 0 && { label: 'Étage', value: String(prop.floor) },
    prop.transaction_type === 'sale' && prop.surface && prop.surface > 0
      && { label: 'Prix / m²', value: `${fmt(Math.round(prop.price / prop.surface))} DT` },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <>
      <main className="pt-16 pb-28 lg:pb-10" style={{ background: 'var(--color-bg)' }}>

        {/* ── Gallery ── */}
        <div className="max-w-screen-xl mx-auto lg:px-8">
          <div className="lg:overflow-hidden">
            <GalleryHero images={images} title={prop.title} />
          </div>
        </div>

        {/* ── Spec strip ── */}
        {specs.length > 0 && (
          <div style={{ background: 'var(--color-surface-warm)', borderBottom: '1px solid var(--color-border)' }}>
            <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
              <dl className="flex flex-wrap">
                {specs.map((s, i) => (
                  <div key={s.label} className="flex flex-col py-4 px-5"
                    style={{ borderRight: i < specs.length - 1 ? '1px solid var(--color-border)' : undefined, paddingLeft: i === 0 ? '0' : undefined }}>
                    <dt className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                      style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                      {s.label}
                    </dt>
                    <dd className="font-display font-bold tabular-nums"
                      style={{ fontSize: '1.0625rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 mt-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">

            {/* ── Left column ── */}
            <div className="lg:col-span-8 space-y-8">

              {/* Back link */}
              <Link href="/logements"
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
                <IconArrowLeft /> Retour aux annonces
              </Link>

              {/* Header */}
              <div>
                {/* Location stamp */}
                {location && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-sans)' }}>
                    <IconPin /> {location}
                  </p>
                )}

                {/* Title */}
                <h1 className="font-display font-bold leading-tight mb-4"
                  style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                  {prop.title}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-xs font-semibold px-2.5 py-1 text-white"
                    style={{ background: 'var(--color-primary)', borderRadius: '8px', fontFamily: 'var(--font-sans)' }}>
                    {typeLabel}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 border"
                    style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)', borderRadius: '8px', fontFamily: 'var(--font-sans)' }}>
                    {prop.transaction_type === 'sale' ? 'Vente' : 'Location'}
                  </span>
                  {prop.is_furnished && (
                    <span className="text-xs font-semibold px-2.5 py-1"
                      style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)', borderRadius: '8px', fontFamily: 'var(--font-sans)' }}>
                      Meublé
                    </span>
                  )}
                </div>

                {/* Price — prominent */}
                <div style={{ borderTop: '2px solid var(--color-accent)', paddingTop: '1.25rem' }}>
                  <p className="font-display font-bold tabular-nums leading-none mb-1"
                    style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                    {fmt(prop.price)}{' '}
                    <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                      {priceLabel}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              {prop.description && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <h2 className="font-display font-bold mb-4"
                    style={{ fontSize: '1.125rem', color: 'var(--color-accent)', letterSpacing: '-0.01em' }}>
                    Description
                  </h2>
                  <p className="leading-loose whitespace-pre-line"
                    style={{ fontSize: '0.9375rem', color: 'var(--color-text)', maxWidth: '70ch', fontFamily: 'var(--font-sans)', lineHeight: 1.8 }}>
                    {prop.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {(prop.amenities?.length ?? 0) > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <h2 className="font-display font-bold mb-5"
                    style={{ fontSize: '1.125rem', color: 'var(--color-accent)', letterSpacing: '-0.01em' }}>
                    Équipements & critères
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--color-border)' }}>
                    {prop.amenities!.map((a, i) => (
                      <div key={a.id}
                        className="flex items-center gap-3 px-4 py-3"
                        style={{
                          borderBottom: i < prop.amenities!.length - 1 ? '1px solid var(--color-border)' : undefined,
                          borderRight: i % 2 === 0 && i < prop.amenities!.length - 1 ? '1px solid var(--color-border)' : undefined,
                        }}>
                        <span style={{ color: 'var(--color-accent)' }}><IconCheck /></span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
                          {a.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar */}
              {similar.length > 0 && (
                <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <h2 className="font-display font-bold mb-6"
                    style={{ fontSize: '1.25rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                    Biens similaires
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {similar.map((s) => <SimilarCard key={s.id} prop={s} />)}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--color-border-strong)', background: 'var(--color-surface)' }}>

                {/* Price header */}
                <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <p className="font-display font-bold tabular-nums leading-none mb-1"
                    style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                    {fmt(prop.price)}{' '}
                    <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                      {priceLabel}
                    </span>
                  </p>
                  {location && (
                    <p className="flex items-center gap-1 text-xs mt-1.5"
                      style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                      <IconPin /> {location}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-5 space-y-3">
                  <button
                    onClick={() => setContactOpen(true)}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-primary)', borderRadius: '10px', fontFamily: 'var(--font-sans)' }}>
                    <IconMessage /> Contacter le propriétaire
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    {contactPhone ? (
                      <a href={`tel:${contactPhone}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border transition-colors"
                        style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', borderRadius: '10px', fontFamily: 'var(--font-sans)' }}>
                        <IconPhone /> Appeler
                      </a>
                    ) : (
                      <button onClick={() => setContactOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border transition-colors"
                        style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', borderRadius: '10px', fontFamily: 'var(--font-sans)' }}>
                        <IconPhone /> Appeler
                      </button>
                    )}
                    {contactPhone ? (
                      <a href={`https://wa.me/${contactPhone.replace(/^\+/, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
                        style={{ background: '#25D366', color: '#fff', borderRadius: '10px', fontFamily: 'var(--font-sans)' }}>
                        <IconWhatsApp /> WhatsApp
                      </a>
                    ) : (
                      <button onClick={() => setContactOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
                        style={{ background: '#25D366', color: '#fff', borderRadius: '10px', fontFamily: 'var(--font-sans)' }}>
                        <IconWhatsApp /> WhatsApp
                      </button>
                    )}
                  </div>

                  {/* Trust line */}
                  <p className="text-xs text-center pt-1"
                    style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                    0 DT de commission · Contact direct avec le propriétaire
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-4 pb-4 pt-3"
        style={{ background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)' }}>
        <button
          onClick={() => setContactOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 text-sm font-semibold text-white shadow-lg"
          style={{ background: 'var(--color-primary)', borderRadius: '10px', fontFamily: 'var(--font-sans)' }}>
          <IconMessage /> Contacter le propriétaire
        </button>
      </div>

      {contactOpen && <ContactPanel prop={prop} onClose={() => setContactOpen(false)} />}
    </>
  )
}
