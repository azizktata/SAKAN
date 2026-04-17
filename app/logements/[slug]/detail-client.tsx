'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import type { Property } from '@/data/properties'

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

function fmt(n: number) { return n.toLocaleString('fr-TN') }

// ── Carousel ──────────────────────────────────────────────────────────────────

function Carousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length])

  return (
    <>
      {/* Mobile: 260px fixed, Desktop: taller */}
      <div className="relative overflow-hidden bg-black"
        style={{ height: 'clamp(260px, 46vw, 580px)' }}>
        <Image
          src={images[idx]}
          alt={`${title} — photo ${idx + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              <IconChevronLeft />
            </button>
            <button onClick={next} aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              <IconChevronRight />
            </button>
          </>
        )}

        {/* Bottom row: counter + "all photos" */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4">
          <span className="text-xs font-medium text-white px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            {idx + 1} / {images.length}
          </span>
          {images.length > 1 && (
            <button onClick={() => setLightboxOpen(true)}
              className="text-xs font-medium text-white px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              Toutes les photos
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Photo ${i + 1}`}
                className="rounded-full transition-all"
                style={{ width: i === idx ? '18px' : '6px', height: '6px', background: i === idx ? 'white' : 'rgba(255,255,255,0.5)' }} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.95)' }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-sm text-white/70">{images.length} photos</span>
            <button onClick={() => setLightboxOpen(false)} aria-label="Fermer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10">
              <IconX />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
              {images.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3]">
                  <Image src={src} alt={`${title} — ${i + 1}`} fill
                    sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Contact panel (modal / drawer) ────────────────────────────────────────────

function ContactPanel({ prop, onClose }: { prop: Property; onClose: () => void }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const priceLabel = prop.mode === 'location' ? '/mois' : 'DT'

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      await navigator.share({ title: prop.title, text: prop.location, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}>
      {/* Panel — bottom sheet on mobile, centered card on sm+ */}
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display font-bold tabular-nums" style={{ fontSize: '1.375rem', color: 'var(--color-text)' }}>
              {fmt(prop.price)}{' '}
              <span className="text-base font-normal" style={{ color: 'var(--color-muted)' }}>{priceLabel}</span>
            </p>
            <p className="text-xs truncate max-w-[22ch]" style={{ color: 'var(--color-muted)' }}>{prop.title}</p>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[oklch(92%_0.008_155)]"
            style={{ color: 'var(--color-muted)' }}>
            <IconX />
          </button>
        </div>

        {/* Call + WhatsApp */}
        <div className="grid grid-cols-2 gap-2.5">
          <a href="tel:+21600000000"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}>
            <IconPhone /> Appeler
          </a>
          <a href="https://wa.me/21600000000" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#25D366', color: '#fff' }}>
            <IconWhatsApp /> WhatsApp
          </a>
        </div>

        {/* Quick message */}
        {sent ? (
          <div className="py-3 text-center rounded-xl" style={{ background: 'oklch(42% 0.09 155 / 0.07)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Message envoyé ✓</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Le propriétaire vous contactera bientôt.</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-2">
            <input type="text" placeholder="Votre nom" value={name}
              onChange={(e) => setName(e.target.value)} required
              className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)' }} />
            <textarea placeholder="Votre message…" value={message}
              onChange={(e) => setMessage(e.target.value)} required rows={3}
              className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)' }} />
            <button type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary-dark)' }}>
              Envoyer le message
            </button>
          </form>
        )}

        {/* Share */}
        <button onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
          <IconShare />
          {copied ? 'Lien copié !' : 'Partager ce bien'}
        </button>
      </div>
    </div>
  )
}

// ── Similar card ──────────────────────────────────────────────────────────────

function SimilarCard({ prop }: { prop: Property }) {
  const priceLabel = prop.mode === 'location' ? '/mois' : 'DT'
  return (
    <Link href={`/logements/${prop.id}`}
      className="group flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', width: '240px' }}>
      <div className="relative h-36 overflow-hidden">
        <Image src={prop.images[0]} alt={prop.title} fill sizes="240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      </div>
      <div className="p-3">
        <p className="font-display font-semibold text-sm leading-snug mb-0.5 truncate" style={{ color: 'var(--color-text)' }}>
          {prop.title}
        </p>
        <p className="text-xs flex items-center gap-1 mb-2" style={{ color: 'var(--color-muted)' }}>
          <IconPin />{prop.location}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-sm tabular-nums" style={{ color: 'var(--color-text)' }}>
            {fmt(prop.price)}{' '}
            <span className="font-normal text-xs" style={{ color: 'var(--color-muted)' }}>{priceLabel}</span>
          </p>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {prop.area} m² · {prop.rooms} ch.
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PropertyDetailClient({ prop, similar }: { prop: Property; similar: Property[] }) {
  const [contactOpen, setContactOpen] = useState(false)
  const badgeBg = prop.badge === 'Exclusif' ? 'var(--color-accent)' : 'var(--color-primary)'

  return (
    <>
      <main className="pt-16 pb-28 lg:pb-10" style={{ background: 'var(--color-bg)' }}>

       

        {/* ── Carousel — full-width, wider on desktop ─────────────────── */}
        <div className="max-w-screen-xl mx-auto lg:px-8">
          <div className="lg:rounded-b-2xl overflow-hidden">
            <Carousel images={prop.images} title={prop.title} />
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 mt-5">
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">

            {/* Left / main */}
            <div className="lg:col-span-8 space-y-5">

              {/* ── Key info — everything visible immediately ─────────── */}
              <div>
                 {/* Back link */}
 
                {/* Badges */}
                {/* <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: prop.mode === 'vente' ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                    {prop.mode === 'vente' ? 'Vente' : 'Location'}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    {prop.status}
                  </span>
                  {prop.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ background: badgeBg }}>
                      {prop.badge}
                    </span>
                  )}
                </div> */}

              
                {/* Title */}
                <h1 className="font-display font-semibold leading-snug mb-2"
                  style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', color: 'var(--color-text)' }}>
                  {prop.title}
                </h1>

                {/* Price */}
             
                {/* Location + specs — same visual rhythm */}
                <p className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--color-muted)' }}>
                  <IconPin /> {prop.location}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                  
                  <span>{prop.rooms} {prop.rooms > 1 ? 'chambres' : 'chambre'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{prop.bathrooms} sdb.</span>
                  <span aria-hidden="true">·</span>
                  <span>{prop.area} m²</span>
                  {prop.floor > 0 && (
                    <><span aria-hidden="true">·</span><span>Étage {prop.floor}</span></>
                  )}
                </p>
   <p className="font-display font-bold tabular-nums leading-none mb-3"
                  style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--color-text)' }}>
                  {fmt(prop.price)}{' '}
                  <span className="text-base font-normal" style={{ color: 'var(--color-muted)' }}>
                    {prop.mode === 'location' ? 'DT / mois' : 'DT'}
                  </span>
                </p>

              </div>

              {/* Features */}
              {prop.features.length > 0 && (
                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
                    Équipements & critères
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prop.features.map((f) => (
                      <span key={f} className="text-sm px-3.5 py-1.5 rounded-full border font-medium"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'var(--color-surface)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
         <Link href="/logements"
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}>
            <IconArrowLeft /> 
          </Link>
              {/* Similar listings */}
              {similar.length > 0 && (
                <section className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <h2 className="font-display font-semibold mb-4"
                    style={{ fontSize: '1.0625rem', color: 'var(--color-text)' }}>
                    Biens similaires
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
                    {similar.map((s) => <SimilarCard key={s.id} prop={s} />)}
                  </div>
                </section>
              )}
            </div>

            {/* Right — desktop sticky contact button + inline panel */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-3">
                <button
                  onClick={() => setContactOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--color-primary)' }}>
                  <IconMessage /> Contacter le propriétaire
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <a href="tel:+21600000000"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-[oklch(42%_0.09_155_/_0.05)]"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                    <IconPhone /> Appeler
                  </a>
                  <a href="https://wa.me/21600000000" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: '#25D366', color: '#fff' }}>
                    <IconWhatsApp /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Sticky bottom bar — mobile only ──────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-4 pb-4 pt-3"
        style={{ background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)' }}>
        <button
          onClick={() => setContactOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-semibold text-white shadow-lg"
          style={{ background: 'var(--color-primary)' }}>
          <IconMessage /> Contacter le propriétaire
        </button>
      </div>

      {/* ── Contact modal ─────────────────────────────────────────────────── */}
      {contactOpen && <ContactPanel prop={prop} onClose={() => setContactOpen(false)} />}
    </>
  )
}
