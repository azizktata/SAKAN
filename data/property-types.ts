export const TYPES = ['Tous', 'Appartement', 'Villa', 'Maison'] as const

export type PropertyType = (typeof TYPES)[number]

export const PROPERTY_TYPES = [
  { name: 'Appartements',       slug: 'appartements',       count: '1 820' },
  { name: 'Villas',             slug: 'villas',             count: '412'   },
  { name: 'Maisons',            slug: 'maisons',            count: '318'   },
  { name: 'Locaux commerciaux', slug: 'locaux-commerciaux', count: '187'   },
] as const
