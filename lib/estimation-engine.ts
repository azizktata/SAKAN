// Price tables: avg DT/m² by city — derived from properties_clean (877 rows, 2026-05-19)
// Vente: apartment base = scraped avg; other types derived by ratio.
// Location: DT/month/m²; apartment base = scraped avg.
// Cities with n<3 in scraped data use nearest governorate avg or _default.

export type TransactionType = 'vente' | 'location'
export type PropertyType = 'apartment' | 'villa' | 'house' | 'land' | 'commercial' | 'office'
export type Condition = 'neuf' | 'bon_etat' | 'a_renover'

// DT/m² for sale — apartment base from scraped avg; ratios: villa×1.35, house×0.90, land×0.45, commercial×1.10, office×1.00
const SALE_PRICE_PER_M2: Record<string, Partial<Record<PropertyType, number>>> = {
  // n≥10 from scraped data — high confidence
  hammamet:   { apartment: 3517, villa: 4750, house: 3165, land: 1580, commercial: 3870, office: 3517 },
  'la-marsa': { apartment: 3265, villa: 4410, house: 2940, land: 1470, commercial: 3590, office: 3265 },
  sousse:     { apartment: 2851, villa: 3850, house: 2566, land: 1280, commercial: 3136, office: 2851 },
  mahdia:     { apartment: 2795, villa: 3773, house: 2516, land: 1258, commercial: 3075, office: 2795 },
  tunis:      { apartment: 2651, villa: 3579, house: 2386, land: 1193, commercial: 2916, office: 2651 },
  ariana:     { apartment: 2641, villa: 3565, house: 2377, land: 1188, commercial: 2905, office: 2641 },
  nabeul:     { apartment: 2428, villa: 3278, house: 2185, land: 1093, commercial: 2671, office: 2428 },
  medenine:   { apartment: 1885, villa: 2545, house: 1697, land:  848, commercial: 2074, office: 1885 },
  manouba:    { apartment: 1882, villa: 2541, house: 1694, land:  847, commercial: 2070, office: 1882 },
  'ben-arous':{ apartment: 1754, villa: 2368, house: 1579, land:  789, commercial: 1929, office: 1754 },
  kairouan:   { apartment: 1723, villa: 2326, house: 1551, land:  775, commercial: 1895, office: 1723 },
  sfax:       { apartment: 1508, villa: 2036, house: 1357, land:  679, commercial: 1659, office: 1508 },
  bizerte:    { apartment: 1504, villa: 2030, house: 1354, land:  677, commercial: 1654, office: 1504 },
  monastir:   { apartment: 1358, villa: 1833, house: 1222, land:  611, commercial: 1494, office: 1358 },
  gabes:      { apartment: 1009, villa: 1362, house:  908, land:  454, commercial: 1110, office: 1009 },
  // Derived from nearest city / regional avg (no vente data for these)
  djerba:     { apartment: 2800, villa: 3780, house: 2520, land: 1260, commercial: 3080, office: 2800 },
  // Default: weighted avg of all scraped cities
  _default:   { apartment: 2100, villa: 2835, house: 1890, land:  945, commercial: 2310, office: 2100 },
}

// DT/month/m² for rental — apartment base from scraped avg; ratios: villa×1.35, house×0.85, land×0.25, commercial×1.20, office×1.10
const RENT_PRICE_PER_M2: Record<string, Partial<Record<PropertyType, number>>> = {
  // n≥10 from scraped data — high confidence
  'la-marsa': { apartment: 20, villa: 27, house: 17, land: 5, commercial: 24, office: 22 },
  mahdia:     { apartment: 17, villa: 23, house: 14, land: 4, commercial: 20, office: 19 },
  tunis:      { apartment: 17, villa: 23, house: 14, land: 4, commercial: 20, office: 19 },
  nabeul:     { apartment: 15, villa: 20, house: 13, land: 4, commercial: 18, office: 17 },
  ariana:     { apartment: 13, villa: 18, house: 11, land: 3, commercial: 16, office: 14 },
  'ben-arous':{ apartment: 12, villa: 16, house: 10, land: 3, commercial: 14, office: 13 },
  sousse:     { apartment: 12, villa: 16, house: 10, land: 3, commercial: 14, office: 13 },
  bizerte:    { apartment: 10, villa: 14, house:  9, land: 3, commercial: 12, office: 11 },
  sfax:       { apartment: 10, villa: 14, house:  9, land: 3, commercial: 12, office: 11 },
  medenine:   { apartment:  9, villa: 12, house:  8, land: 2, commercial: 11, office: 10 },
  monastir:   { apartment:  9, villa: 12, house:  8, land: 2, commercial: 11, office: 10 },
  manouba:    { apartment:  9, villa: 12, house:  8, land: 2, commercial: 11, office: 10 },
  kairouan:   { apartment:  8, villa: 11, house:  7, land: 2, commercial: 10, office:  9 },
  gabes:      { apartment:  6, villa:  8, house:  5, land: 2, commercial:  7, office:  7 },
  // Derived — no rental data but similar market to nearby city
  hammamet:   { apartment: 14, villa: 19, house: 12, land: 4, commercial: 17, office: 15 },
  djerba:     { apartment: 14, villa: 19, house: 12, land: 4, commercial: 17, office: 15 },
  // Default: conservative floor across all scraped cities
  _default:   { apartment:  9, villa: 12, house:  8, land: 2, commercial: 11, office: 10 },
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

const BUILDING_AGE_FACTOR: [number, number, number][] = [
  // [minAge, maxAge, factor]
  [0,  5,  1.00],
  [6,  15, 0.98],
  [16, 30, 0.95],
  [31, 50, 0.90],
  [51, Infinity, 0.85],
]

const YEAR_RANGE_TO_AGE: Record<string, number> = {
  '2020+':     2,
  '2010-2019': 12,
  '2000-2009': 22,
  '1990-1999': 32,
  '1980-1989': 42,
  'avant-1980': 55,
}

function buildingAgeFactor(yearRange: string | null | undefined): number {
  if (!yearRange) return 1.0
  const age = YEAR_RANGE_TO_AGE[yearRange]
  if (age === undefined) return 1.0
  for (const [min, max, factor] of BUILDING_AGE_FACTOR) {
    if (age >= min && age <= max) return factor
  }
  return 1.0
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
  zoneScore?: number         // 1–5, from locations API; adjusts base ±16%
  // Extended inputs
  parkingSpaces?:    number
  gardenSurface?:    number   // m²
  terraceSurface?:   number   // m²
  hasTerrace?:       boolean
  buildingYearRange?: string | null
}

export function estimate(input: EstimationInput): EstimationResult {
  const { transactionType, propertyType, citySlug, surface, bedrooms, floor,
          condition, isFurnished, hasParking, hasElevator, hasGarden, hasPool,
          zoneScore, parkingSpaces, gardenSurface, terraceSurface, hasTerrace, buildingYearRange } = input

  const table = transactionType === 'vente' ? SALE_PRICE_PER_M2 : RENT_PRICE_PER_M2
  const cityRow = table[citySlug] ?? table['_default']
  const basePricePerM2 = cityRow[propertyType] ?? (table['_default'][propertyType] ?? 1500)

  // zone_score adjusts base price: score 3 = neutral, 1 = −16%, 5 = +16%
  const zoneMultiplier = zoneScore != null ? 1 + (zoneScore - 3) * 0.08 : 1.0

  let multiplier = zoneMultiplier
  const factors: EstimationFactor[] = []

  // City / zone
  const known = !!table[citySlug]
  const zoneDetail = zoneScore != null && zoneScore !== 3
    ? ` — zone ${zoneScore}/5 (${zoneScore > 3 ? '+' : ''}${Math.round((zoneMultiplier - 1) * 100)}%)`
    : ''
  factors.push({
    label: 'Localisation',
    impact: zoneScore != null && zoneScore > 3 ? 'positive' : zoneScore != null && zoneScore < 3 ? 'negative' : 'neutral',
    detail: known
      ? `${citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — données marché réelles${zoneDetail}`
      : `Estimation approximative${zoneDetail}`,
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

  // Amenities — richer formula using sub-inputs
  const parkingBonus   = hasParking  ? Math.min(0.04, 0.02 + ((parkingSpaces  ?? 1) - 1) * 0.005) : 0
  const gardenBonus    = hasGarden   ? Math.min(0.05, ((gardenSurface   ?? 0) / 50) * 0.01) : 0
  const terraceBonus   = hasTerrace  ? Math.min(0.03, ((terraceSurface  ?? 0) / 30) * 0.01) : 0
  const elevatorBonus  = hasElevator ? 0.02 : 0
  const poolBonus      = hasPool     ? 0.05 : 0

  const amenityBonus = parkingBonus + gardenBonus + terraceBonus + elevatorBonus + poolBonus
  if (amenityBonus > 0) {
    multiplier *= (1 + amenityBonus)
    const list = [
      hasParking  && `parking${(parkingSpaces ?? 1) > 1 ? ` ×${parkingSpaces}` : ''}`,
      hasElevator && 'ascenseur',
      hasGarden   && `jardin${gardenSurface ? ` ${gardenSurface}m²` : ''}`,
      hasTerrace  && `terrasse${terraceSurface ? ` ${terraceSurface}m²` : ''}`,
      hasPool     && 'piscine',
    ].filter(Boolean).join(', ')
    factors.push({ label: 'Équipements', impact: 'positive', detail: `${list} (+${Math.round(amenityBonus * 100)}%)` })
  }

  // Building age (applied independently of condition — an old bien-entretenu still depreciates)
  const ageFactor = buildingAgeFactor(buildingYearRange)
  if (ageFactor < 1.0) {
    multiplier *= ageFactor
    factors.push({
      label: 'Année de construction',
      impact: 'negative',
      detail: `${buildingYearRange} (${Math.round((ageFactor - 1) * 100)}%)`,
    })
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
