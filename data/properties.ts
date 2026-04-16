export interface Property {
  id: number
  title: string
  location: string
  price: number
  area: number
  rooms: number
  bathrooms: number
  floor: number
  type: string
  status: 'Neuf' | 'Ancien'
  badge: string | null
  images: string[]
  features: string[]
  mode: 'vente' | 'location'
}

export const ALL_PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'Appartement lumineux',
    location: 'Centre-ville, Tunis',
    price: 285000, area: 95, rooms: 3, bathrooms: 2, floor: 3,
    type: 'Appartement', status: 'Neuf', badge: 'Nouveau',
    images: ['/prop-6.jpg', '/prop-3.jpg'],
    features: ['Ascenseur', 'Terrasse'],
    mode: 'vente',
  },
  {
    id: 2,
    title: 'Villa avec jardin privé',
    location: 'La Marsa, Tunis',
    price: 850000, area: 220, rooms: 5, bathrooms: 3, floor: 0,
    type: 'Villa', status: 'Neuf', badge: 'Exclusif',
    images: ['/prop-10.jpg', '/prop-5.jpg', '/prop-1.jpg'],
    features: ['Garage', 'Terrasse', 'Jardin'],
    mode: 'vente',
  },
  {
    id: 3,
    title: 'Maison traditionnelle',
    location: 'Sidi Bou Saïd, Tunis',
    price: 580000, area: 200, rooms: 5, bathrooms: 3, floor: 0,
    type: 'Maison', status: 'Ancien', badge: null,
    images: ['/prop-7.jpg', '/prop-1.jpg'],
    features: ['Jardin', 'Terrasse'],
    mode: 'vente',
  },
  {
    id: 4,
    title: 'Appartement vue mer',
    location: 'Corniche, Sousse',
    price: 195000, area: 75, rooms: 2, bathrooms: 1, floor: 5,
    type: 'Appartement', status: 'Neuf', badge: null,
    images: ['/prop-9.jpg', '/prop-2.jpg'],
    features: ['Ascenseur'],
    mode: 'vente',
  },
  {
    id: 5,
    title: 'Cour intérieure — Médina',
    location: 'Médina, Tunis',
    price: 420000, area: 160, rooms: 4, bathrooms: 2, floor: 0,
    type: 'Maison', status: 'Ancien', badge: 'Nouveau',
    images: ['/prop-1.jpg', '/prop-7.jpg'],
    features: ['Jardin', 'Terrasse'],
    mode: 'vente',
  },
  {
    id: 6,
    title: 'Villa prestige — La Marsa',
    location: 'La Marsa, Tunis',
    price: 1200000, area: 320, rooms: 6, bathrooms: 4, floor: 0,
    type: 'Villa', status: 'Neuf', badge: 'Exclusif',
    images: ['/prop-5.jpg', '/prop-10.jpg', '/prop-2.jpg'],
    features: ['Garage', 'Terrasse', 'Jardin', 'Ascenseur'],
    mode: 'vente',
  },
  {
    id: 7,
    title: 'Appartement familial',
    location: 'El Menzah, Tunis',
    price: 310000, area: 120, rooms: 3, bathrooms: 2, floor: 2,
    type: 'Appartement', status: 'Neuf', badge: null,
    images: ['/prop-3.jpg', '/prop-6.jpg'],
    features: ['Ascenseur', 'Garage'],
    mode: 'vente',
  },
  {
    id: 8,
    title: 'Duplex avec grande terrasse',
    location: 'Les Berges du Lac, Tunis',
    price: 490000, area: 185, rooms: 4, bathrooms: 3, floor: 6,
    type: 'Appartement', status: 'Neuf', badge: null,
    images: ['/prop-2.jpg', '/prop-8.jpg'],
    features: ['Ascenseur', 'Terrasse'],
    mode: 'vente',
  },
  {
    id: 9,
    title: 'Maison de campagne',
    location: 'Hammamet',
    price: 1800, area: 130, rooms: 3, bathrooms: 2, floor: 0,
    type: 'Maison', status: 'Ancien', badge: null,
    images: ['/prop-4.jpg', '/prop-7.jpg'],
    features: ['Jardin', 'Terrasse', 'Garage'],
    mode: 'location',
  },
  {
    id: 10,
    title: 'Studio design Lac',
    location: 'Les Berges du Lac, Tunis',
    price: 650, area: 48, rooms: 1, bathrooms: 1, floor: 4,
    type: 'Appartement', status: 'Neuf', badge: 'Nouveau',
    images: ['/prop-8.jpg', '/prop-3.jpg'],
    features: ['Ascenseur'],
    mode: 'location',
  },
  {
    id: 11,
    title: 'Villa historique',
    location: 'Sidi Bou Saïd, Tunis',
    price: 3500, area: 280, rooms: 6, bathrooms: 4, floor: 0,
    type: 'Villa', status: 'Ancien', badge: null,
    images: ['/prop-10.jpg', '/prop-5.jpg'],
    features: ['Jardin', 'Terrasse', 'Garage'],
    mode: 'location',
  },
  {
    id: 12,
    title: 'Appartement moderne Sfax',
    location: 'Centre, Sfax',
    price: 900, area: 88, rooms: 2, bathrooms: 1, floor: 1,
    type: 'Appartement', status: 'Neuf', badge: null,
    images: ['/prop-6.jpg', '/prop-9.jpg'],
    features: ['Ascenseur'],
    mode: 'location',
  },
]
