// Price tables: median DT/m² by city and property type (vente + location)
// Calibrated against Mubawab listings (2024–2025 sample, ~30 vente / ~70 location)

export type TransactionType = 'vente' | 'location'
export type PropertyType = 'apartment' | 'villa' | 'house' | 'land' | 'commercial' | 'office'
export type Condition = 'neuf' | 'bon_etat' | 'a_renover'

// DT/m² for sale — medians from market data where n≥2, estimates elsewhere
const SALE_PRICE_PER_M2: Record<string, Partial<Record<PropertyType, number>>> = {
  tunis:      { apartment: 3200, villa: 4500, house: 2800, land: 2200, commercial: 3500, office: 3000 },
  'la-marsa': { apartment: 5000, villa: 6500, house: 4200, land: 4000, commercial: 4800, office: 4200 },
  ariana:     { apartment: 2900, villa: 4700, house: 2600, land: 1800, commercial: 3000, office: 2600 },
  sousse:     { apartment: 3000, villa: 3800, house: 2400, land: 1500, commercial: 2800, office: 2400 },
  sfax:       { apartment: 2000, villa: 2800, house: 1800, land: 1200, commercial: 2200, office: 1900 },
  hammamet:   { apartment: 3500, villa: 4200, house: 2800, land: 2000, commercial: 3000, office: 2600 },
  monastir:   { apartment: 2400, villa: 3200, house: 2100, land: 1400, commercial: 2600, office: 2200 },
  nabeul:     { apartment: 2200, villa: 3000, house: 2000, land: 1300, commercial: 2400, office: 2000 },
  kairouan:   { apartment: 2900, villa: 3500, house: 2200, land: 900,  commercial: 2400, office: 2000 },
  bizerte:    { apartment: 2200, villa: 3000, house: 2000, land: 1000, commercial: 2200, office: 1900 },
  'ben-arous':{ apartment: 2600, villa: 3500, house: 2300, land: 1600, commercial: 2800, office: 2400 },
  djerba:     { apartment: 3000, villa: 4500, house: 2800, land: 2200, commercial: 3000, office: 2600 },
  mahdia:     { apartment: 2000, villa: 2800, house: 1800, land: 1000, commercial: 2000, office: 1800 },
  _default:   { apartment: 2200, villa: 3000, house: 1900, land: 1000, commercial: 2200, office: 1900 },
}

// DT/month/m² for rental — La Marsa apartment calibrated from n=35 sample (median 21.7)
const RENT_PRICE_PER_M2: Record<string, Partial<Record<PropertyType, number>>> = {
  tunis:      { apartment: 16, villa: 22, house: 14, land: 4,  commercial: 18, office: 16 },
  'la-marsa': { apartment: 22, villa: 20, house: 17, land: 8,  commercial: 24, office: 22 },
  ariana:     { apartment: 13, villa: 18, house: 11, land: 3,  commercial: 15, office: 13 },
  sousse:     { apartment: 12, villa: 16, house: 10, land: 3,  commercial: 14, office: 12 },
  sfax:       { apartment: 10, villa: 14, house:  9, land: 2,  commercial: 12, office: 10 },
  hammamet:   { apartment: 14, villa: 20, house: 12, land: 4,  commercial: 15, office: 13 },
  monastir:   { apartment: 11, villa: 15, house: 10, land: 3,  commercial: 13, office: 11 },
  nabeul:     { apartment: 10, villa: 14, house:  9, land: 2,  commercial: 12, office: 10 },
  kairouan:   { apartment:  8, villa: 11, house:  7, land: 2,  commercial: 10, office:  8 },
  bizerte:    { apartment: 10, villa: 13, house:  9, land: 2,  commercial: 11, office:  9 },
  'ben-arous':{ apartment: 12, villa: 16, house: 10, land: 2,  commercial: 13, office: 11 },
  djerba:     { apartment: 14, villa: 22, house: 12, land: 3,  commercial: 14, office: 12 },
  mahdia:     { apartment:  8, villa: 12, house:  7, land: 2,  commercial:  9, office:  8 },
  _default:   { apartment:  9, villa: 13, house:  8, land: 2,  commercial: 11, office:  9 },
}

// Multipliers
const CONDITION_FACTOR: Record<Condition, number> = {
  neuf:      1.15,
  bon_etat:  1.00,
  a_renover: 0.80,
}

function floorFactor(floor: number): number {
  if (floor === 0) return 0.96    // rez-de-chaussée slight discount
  if (floor === 1) return 1.00
  if (floor <= 4)  return 1.03
  return 1.00                     // high floors neutral without elevator context
}

function roomsFactor(bedrooms: number, surface: number): number {
  // Good room ratio (≥12 m² per bedroom) is a positive signal
  if (bedrooms === 0) return 1.0
  const ratio = surface / bedrooms
  if (ratio >= 18) return 1.04
  if (ratio >= 12) return 1.00
  return 0.96
}

export interface EstimationInput {
  transactionType: TransactionType
  propertyType: PropertyType
  citySlug: string
  address?: string
  surface: number
  bedrooms: number
  bathrooms: number
  floor: number
  condition: Condition
  isFurnished: boolean
  hasParking: boolean
  hasElevator: boolean
  hasGarden: boolean
  hasPool: boolean
}

export interface EstimationFactor {
  label: string
  impact: 'positive' | 'neutral' | 'negative'
  detail: string
}

export interface EstimationResult {
  low: number
  mid: number
  high: number
  unit: string        // 'DT' for vente, 'DT/mois' for location
  factors: EstimationFactor[]
}

export function estimate(input: EstimationInput): EstimationResult {
  const { transactionType, propertyType, citySlug, surface, bedrooms, floor,
          condition, isFurnished, hasParking, hasElevator, hasGarden, hasPool } = input

  const table = transactionType === 'vente' ? SALE_PRICE_PER_M2 : RENT_PRICE_PER_M2
  const cityRow = table[citySlug] ?? table['_default']
  const basePricePerM2 = cityRow[propertyType] ?? (table['_default'][propertyType] ?? 1500)

  let multiplier = 1.0
  const factors: EstimationFactor[] = []

  // City
  const known = !!table[citySlug]
  factors.push({
    label: 'Localisation',
    impact: 'neutral',
    detail: known ? `${citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — marché de référence` : 'Ville non couverte, estimation approximative',
  })

  // Surface
  factors.push({
    label: 'Surface',
    impact: 'neutral',
    detail: `${surface} m² — base de calcul`,
  })

  // Condition
  const condFactor = CONDITION_FACTOR[condition]
  multiplier *= condFactor
  factors.push({
    label: 'État du bien',
    impact: condition === 'neuf' ? 'positive' : condition === 'a_renover' ? 'negative' : 'neutral',
    detail: condition === 'neuf' ? `Neuf ou récent (+${Math.round((condFactor - 1) * 100)}%)`
           : condition === 'a_renover' ? `À rénover (${Math.round((condFactor - 1) * 100)}%)`
           : 'Bon état (neutre)',
  })

  // Floor
  const ff = floorFactor(floor)
  multiplier *= ff
  if (floor === 0) {
    factors.push({ label: 'Étage', impact: 'negative', detail: 'Rez-de-chaussée (−4%)' })
  } else if (floor >= 2 && floor <= 4) {
    factors.push({ label: 'Étage', impact: 'positive', detail: `Étage ${floor} (+3%)` })
  } else {
    factors.push({ label: 'Étage', impact: 'neutral', detail: `Étage ${floor}` })
  }

  // Rooms ratio
  const rf = roomsFactor(bedrooms, surface)
  multiplier *= rf
  if (rf > 1) {
    factors.push({ label: 'Configuration', impact: 'positive', detail: `${bedrooms} ch. pour ${surface} m² — bon ratio (+4%)` })
  } else if (rf < 1) {
    factors.push({ label: 'Configuration', impact: 'negative', detail: `${bedrooms} ch. pour ${surface} m² — ratio serré (−4%)` })
  }

  // Furnished
  if (isFurnished && transactionType === 'location') {
    multiplier *= 1.10
    factors.push({ label: 'Meublé', impact: 'positive', detail: 'Bien meublé (+10%)' })
  } else if (isFurnished && transactionType === 'vente') {
    multiplier *= 1.04
    factors.push({ label: 'Meublé', impact: 'positive', detail: 'Inclus dans la vente (+4%)' })
  }

  // Amenities
  const amenityBonus = (hasParking ? 0.03 : 0) + (hasElevator ? 0.02 : 0) + (hasGarden ? 0.03 : 0) + (hasPool ? 0.05 : 0)
  if (amenityBonus > 0) {
    multiplier *= (1 + amenityBonus)
    const list = [hasParking && 'parking', hasElevator && 'ascenseur', hasGarden && 'jardin', hasPool && 'piscine']
      .filter(Boolean).join(', ')
    factors.push({ label: 'Équipements', impact: 'positive', detail: `${list} (+${Math.round(amenityBonus * 100)}%)` })
  }

  const round = transactionType === 'location' ? 50 : 1000
  const mid = Math.round(basePricePerM2 * surface * multiplier / round) * round
  const low  = Math.round(mid * 0.88 / round) * round
  const high = Math.round(mid * 1.12 / round) * round

  return {
    low,
    mid,
    high,
    unit: transactionType === 'vente' ? 'DT' : 'DT/mois',
    factors,
  }
}
