import axios from 'axios'

// ── Domain types ───────────────────────────────────────────────────────────────

export type UserRole = 'particulier' | 'agent' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  image?: string | null
  role: UserRole
  phone?: string | null
}

export type PropertyStatus     = 'draft' | 'published' | 'sold' | 'rented'
export type TransactionType    = 'sale' | 'rent'
export type PropertyType       = 'apartment' | 'villa' | 'house' | 'land' | 'commercial' | 'office'

export type Property = {
  id: string
  title: string
  description?: string
  price: number
  transaction_type: TransactionType
  property_type: PropertyType
  status: PropertyStatus
  location_id?: string
  location?: { id: string; name: string; slug: string }
  address?: string
  surface?: number
  bedrooms?: number
  bathrooms?: number
  floor?: number
  is_furnished: boolean
  latitude?: number
  longitude?: number
  user_id: string
  created_at: string
  updated_at: string
  images?: Array<{ id: string; url: string; position: number; is_cover: boolean }>
  amenities?: Array<{ id: string; name: string; slug: string }>
}

export type Contact = {
  id: string
  property_id: string
  user_id?: string
  name: string
  phone?: string
  message: string
  created_at: string
  property?: Pick<Property, 'id' | 'title'>
}

export type PropertyFilters = {
  transaction_type?: TransactionType
  property_type?: string
  location_id?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  amenities?: string   // comma-separated amenity IDs
  page?: number
  per_page?: number
}

export type PropertyPayload = {
  title: string
  description?: string
  price: number
  transaction_type: TransactionType
  property_type: string
  status?: PropertyStatus
  location_id?: string
  address?: string
  surface?: number
  bedrooms?: number
  bathrooms?: number
  floor?: number
  is_furnished?: boolean
  latitude?: number
  longitude?: number
  amenity_ids?: string[]
  images?: Array<{ url: string; position: number; is_cover: boolean }>
}

export type Location = { id: number | string; name: string; slug: string }
export type Amenity  = { id: number | string; name: string; slug: string }

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  next_page_url: string | null
  prev_page_url: string | null
}

export type AdminFilters = {
  status?: PropertyStatus
  page?: number
  per_page?: number
}

export type LoginPayload    = { email: string; password: string }
export type RegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// ── Axios instance ─────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? ''
    const isAuthCheck = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register') || /\/properties\/[^/]+\/contacts$/.test(url)
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !isAuthCheck &&
      !window.location.pathname.startsWith('/auth')
    ) {
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  },
)

export default api

// ── Auth ───────────────────────────────────────────────────────────────────────

export const authApi = {
  register:       (data: RegisterPayload) => api.post<{ user: User }>('/auth/register', data),
  login:          (data: LoginPayload)    => api.post<{ user: User }>('/auth/login', data),
  logout:         ()                      => api.post('/auth/logout'),
  me:             ()                      => api.get<User>('/auth/me'),
  googleRedirect: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`
  },
}

// ── Properties ─────────────────────────────────────────────────────────────────

export const propertiesApi = {
  list:       (params?: PropertyFilters)                           => api.get<Paginated<Property>>('/properties', { params }),
  get:        (id: string)                                         => api.get<Property>(`/properties/${id}`),
  create:     (data: PropertyPayload)                              => api.post<Property>('/properties', data),
  update:     (id: string, data: Partial<PropertyPayload>)        => api.patch<Property>(`/properties/${id}`, data),
  delete:     (id: string)                                         => api.delete(`/properties/${id}`),
  myList:     ()                                                   => api.get<Paginated<Property>>('/user/properties'),
  myContacts: ()                                                   => api.get<Paginated<Contact>>('/user/contacts'),
  contact:    (id: string, data: { name: string; phone?: string; message: string }) =>
                                                                      api.post(`/properties/${id}/contacts`, data),
}

// ── User ───────────────────────────────────────────────────────────────────────

export const userApi = {
  update: (data: { name?: string; phone?: string }) => api.patch<User>('/user/me', data),
}

// ── Reference data ────────────────────────────────────────────────────────────

export const referenceApi = {
  locations: () => api.get<Location[]>('/locations'),
  amenities: () => api.get<Amenity[]>('/amenities'),
}

// ── Upload ─────────────────────────────────────────────────────────────────────

export const uploadApi = {
  image: (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return api.post<{ url: string }>('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  properties:     (params?: AdminFilters)                          => api.get<Property[]>('/admin/properties', { params }),
  updateProperty: (id: string, data: Partial<PropertyPayload>)    => api.patch<Property>(`/admin/properties/${id}`, data),
  deleteProperty: (id: string)                                     => api.delete(`/admin/properties/${id}`),
  users:          ()                                               => api.get<User[]>('/admin/users'),
  updateUser:     (id: string, data: { role?: UserRole })         => api.patch<User>(`/admin/users/${id}`, data),
}
