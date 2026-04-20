'use client'

import { useRef, useEffect } from 'react'
import type { Map, Marker } from 'leaflet'
import type { Property } from '@/lib/api'
import 'leaflet/dist/leaflet.css'

type MarkerEntry = { id: string; el: HTMLDivElement; marker: Marker }

interface Props {
  properties: Property[]
  hoveredId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

function tooltipHtml(prop: Property) {
  const priceLabel = prop.transaction_type === 'rent' ? ' DT / mois' : ' DT'
  const cover = prop.images?.find((i) => i.is_cover) ?? prop.images?.[0]
  const locationName = prop.location?.name ?? prop.address ?? ''
  return `
    <div class="map-tooltip">
      ${cover ? `<img class="map-tooltip-img" src="${cover.url}" alt="${prop.title}" />` : ''}
      <div class="map-tooltip-body">
        <p class="map-tooltip-title">${prop.title}</p>
        <p class="map-tooltip-location">${locationName}</p>
        <p class="map-tooltip-price">${fmt(prop.price)}${priceLabel}</p>
      </div>
    </div>
  `
}

export function MapView({ properties, hoveredId, onHover, onSelect }: Props) {
  const mapRef       = useRef<Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef   = useRef<MarkerEntry[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet')

    mapRef.current = L.map(containerRef.current, {
      center: [36.82, 10.18],
      zoom: 8,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet')

    markersRef.current.forEach(({ marker }) => marker.remove())
    markersRef.current = []

    properties.forEach((prop) => {
      if (!prop.latitude || !prop.longitude) return

      const el = document.createElement('div')
      el.className = 'map-marker'
      el.textContent = prop.transaction_type === 'rent'
        ? `${fmt(prop.price)} DT`
        : `${Math.round(prop.price / 1000)}k DT`

      el.addEventListener('mouseenter', () => onHover(prop.id))
      el.addEventListener('mouseleave', () => onHover(null))
      el.addEventListener('click', () => onSelect(prop.id))

      const icon = L.divIcon({ html: el, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })
      const marker = L.marker([prop.latitude!, prop.longitude!], { icon }).addTo(mapRef.current!)

      marker.bindTooltip(tooltipHtml(prop), {
        direction: 'top',
        offset: L.point(0, -52),
        className: 'map-tooltip-wrap',
        sticky: false,
      })

      markersRef.current.push({ id: prop.id, el, marker })
    })
  }, [properties, onHover, onSelect])

  useEffect(() => {
    markersRef.current.forEach(({ id, el }) => {
      el.setAttribute('data-hovered', String(id === hoveredId))
    })
  }, [hoveredId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
