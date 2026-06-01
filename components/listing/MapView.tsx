'use client'

import { useRef, useEffect } from 'react'
import type { Map, Marker } from 'leaflet'
import type { Property } from '@/lib/api'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

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
  const mapRef        = useRef<Map | null>(null)
  const containerRef  = useRef<HTMLDivElement>(null)
  const markersRef    = useRef<MarkerEntry[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef    = useRef<any>(null)
  const propIdsRef    = useRef<string>('')
  const onHoverRef    = useRef(onHover)
  const onSelectRef   = useRef(onSelect)

  // Keep callback refs current without triggering re-renders
  useEffect(() => { onHoverRef.current = onHover }, [onHover])
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

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
      clusterRef.current = null
      propIdsRef.current = ''
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Skip rebuild if same set of properties (by id) — preserves spiderfy/zoom state
    const nextIds = properties.map((p) => p.id).join(',')
    if (nextIds === propIdsRef.current) return
    propIdsRef.current = nextIds

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet.markercluster')

    // Remove old cluster group
    if (clusterRef.current) {
      mapRef.current.removeLayer(clusterRef.current)
    }
    markersRef.current = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
      spiderfyDistanceMultiplier: 2,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount()
        return L.divIcon({
          html: `<div class="map-cluster">${count}</div>`,
          className: '',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        })
      },
    })

    properties.forEach((prop) => {
      if (!prop.latitude || !prop.longitude) return

      const lat = Number(prop.latitude)
      const lng = Number(prop.longitude)

      const el = document.createElement('div')
      el.className = 'map-marker'
      el.textContent = prop.transaction_type === 'rent'
        ? `${fmt(prop.price)} DT`
        : `${Math.round(prop.price / 1000)}k DT`

      el.addEventListener('mouseenter', () => onHoverRef.current(prop.id))
      el.addEventListener('mouseleave', () => onHoverRef.current(null))
      el.addEventListener('click', () => onSelectRef.current(prop.id))

      const icon = L.divIcon({ html: el, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })
      const marker = L.marker([lat, lng] as [number, number], { icon })

      marker.bindTooltip(tooltipHtml(prop), {
        direction: 'top',
        offset: L.point(0, -52),
        className: 'map-tooltip-wrap',
        sticky: false,
      })

      cluster.addLayer(marker)
      markersRef.current.push({ id: prop.id, el, marker })
    })

    cluster.addTo(mapRef.current)
    clusterRef.current = cluster
  }, [properties])

  useEffect(() => {
    markersRef.current.forEach(({ id, el }) => {
      el.setAttribute('data-hovered', String(id === hoveredId))
    })
  }, [hoveredId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
