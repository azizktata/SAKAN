'use client'

import { useRef, useEffect } from 'react'
import type { Map, Marker } from 'leaflet'
import type { Property } from '@/data/properties'
import 'leaflet/dist/leaflet.css'

type MarkerEntry = { id: number; el: HTMLDivElement; marker: Marker }

interface Props {
  properties: Property[]
  hoveredId: number | null
  onHover: (id: number | null) => void
  onSelect: (id: number) => void
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

function tooltipHtml(prop: Property) {
  const priceLabel = prop.mode === 'location' ? ' DT / mois' : ' DT'
  return `
    <div class="map-tooltip">
      <img class="map-tooltip-img" src="${prop.images[0]}" alt="${prop.title}" />
      <div class="map-tooltip-body">
        <p class="map-tooltip-title">${prop.title}</p>
        <p class="map-tooltip-location">${prop.location}</p>
        <p class="map-tooltip-price">${fmt(prop.price)}${priceLabel}</p>
      </div>
    </div>
  `
}

export function MapView({ properties, hoveredId, onHover, onSelect }: Props) {
  const mapRef       = useRef<Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef   = useRef<MarkerEntry[]>([])

  // Init map once
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

  // Re-create markers when filtered properties change
  useEffect(() => {
    if (!mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet')

    markersRef.current.forEach(({ marker }) => marker.remove())
    markersRef.current = []

    properties.forEach((prop) => {
      const el = document.createElement('div')
      el.className = 'map-marker'
      el.textContent = prop.mode === 'location'
        ? `${fmt(prop.price)} DT`
        : `${Math.round(prop.price / 1000)} DT`

      el.addEventListener('mouseenter', () => onHover(prop.id))
      el.addEventListener('mouseleave', () => onHover(null))
      el.addEventListener('click', () => onSelect(prop.id))

      const icon = L.divIcon({ html: el, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })
      const marker = L.marker([prop.lat, prop.lng], { icon }).addTo(mapRef.current!)

      // Hover tooltip with image + info
      marker.bindTooltip(tooltipHtml(prop), {
        direction: 'top',
        offset: L.point(0, -52),
        className: 'map-tooltip-wrap',
        sticky: false,
      })

      markersRef.current.push({ id: prop.id, el, marker })
    })
  }, [properties, onHover, onSelect])

  // Update highlight when hoveredId changes
  useEffect(() => {
    markersRef.current.forEach(({ id, el }) => {
      el.setAttribute('data-hovered', String(id === hoveredId))
    })
  }, [hoveredId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
