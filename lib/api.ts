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
  created_at?: string
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

export type Location = {
  id:             number | string
  name:           string
  slug:           string
  parent_id:      number | null
  zone_score:     number
  neighborhoods:  string[]
  latitude?:      number | null
  longitude?:     number | null
}
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
  search?: string
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}

export type LoginPayload    = { email: string; password: string; visitor_key?: string }
export type RegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
  visitor_key?: string
}

// ── Axios instance ─────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api',
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
    window.location.href = '/api/auth/google/redirect'
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
  contact:    (id: string, data: { name: string; phone: string; message: string }) =>
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

// ── Estimation ────────────────────────────────────────────────────────────────

export type EstimatePayload = {
  city:             string
  property_type:    string
  transaction_type: 'vente' | 'location'
  surface:          number
  bedrooms?:        number
  condition?:       string
  zone_score?:      number
  amenities_count?: number
  neighborhood?:    string
  governorate?:     string
  // Extended inputs
  garden_surface?:  number
  parking_spaces?:  number
  terrace_surface?: number
  building_age?:    number
}

export type EstimateResponse = {
  low:            number
  mid:            number
  high:           number
  unit:           string
  confidence?:    number
  model_version?: string
  fallback?:      boolean
  message?:       string
  estimation_id:  string
}

export const estimationApi = {
  estimate: (payload: EstimatePayload) =>
    api.post<EstimateResponse>('/estimate', payload).then(r => r.data),
  feedback: (estimationId: string, opinion: 'too_high' | 'correct' | 'too_low') =>
    api.post<{ success: boolean }>(`/estimate/${estimationId}/feedback`, { opinion }),
}

// ── Analytics (owner) ──────────────────────────────────────────────────────────

export type ViewSource = 'direct' | 'listing' | 'map'

export type TrackViewPayload = {
  property_id: string | number
  visitor_key?: string
  source: ViewSource
}

export type DailyTrend = {
  date:         string
  views:        number
  unique_views: number
}

export type PropertyStats = {
  total_views:     number
  unique_views:    number
  total_contacts:  number
  conversion_rate: number
  period_stats:    DailyTrend[]
}

export type OwnerSummary = {
  total_views:          number
  total_unique_views:   number
  total_contacts:       number
  avg_conversion_rate:  number
  top_property?: { id: string; title: string; views: number } | null
  avg_duration_seconds: number | null
  top_countries:        { country: string; views: number }[]
}

export type SessionStartPayload = {
  visitor_key: string
  entry_page?: string
  device?: 'mobile' | 'desktop' | 'tablet' | 'unknown'
}

export type TrackSearchPayload = {
  search_id: string
  filters: Record<string, unknown>
  results_count: number
  visitor_key?: string
  session_token?: string
}

export type MarketInsight = {
  id: number
  name: string
  slug: string
  searches_count: number
  searches_zero_results: number
  views_total: number
  properties_published: number
  avg_price: number | null
  demand_index: number
  attractiveness_score: number
  liquidity_index: number
  search_gap_index: number
}

export type SessionStats = {
  total_sessions: number
  avg_duration_seconds: number
  avg_pages_per_session: number
  bounce_rate: number
  device_breakdown: { device: string; count: number }[]
  period_days: number
}

export type GeoBreakdown = {
  by_country: { country: string; views_total: number; unique_visitors: number }[]
  by_city: { country: string; city_geo: string; views_total: number; unique_visitors: number }[]
  period_days: number
}

export const analyticsApi = {
  trackView:      (payload: TrackViewPayload)                      => api.post<{ tracked: boolean; visitor_key: string; view_id: string }>('/events/view', payload),
  propertyStats:  (id: string | number)                           => api.get<PropertyStats>(`/analytics/property/${id}`),
  propertyTrend:  (id: string | number, days: 7 | 30 = 7)       => api.get<DailyTrend[]>(`/analytics/property/${id}/trend`, { params: { days } }),
  ownerSummary:   ()                                              => api.get<OwnerSummary>('/analytics/my-properties'),
  trackSearch:    (payload: TrackSearchPayload)                   => api.post<{ tracked: boolean }>('/events/search', payload),
  updateDuration: (view_id: string, duration_seconds: number)    => api.patch<{ updated: boolean }>(`/events/view/${view_id}/duration`, { duration_seconds }),
}

// ── Session ────────────────────────────────────────────────────────────────────

export const sessionApi = {
  start: (payload: SessionStartPayload) =>
    api.post<{ session_token: string }>('/sessions/start', payload),
  ping: (session_token: string) =>
    api.patch('/sessions/ping', { session_token }),
  end: (session_token: string) =>
    api.patch('/sessions/end', { session_token }),
}

// ── Admin Analytics ────────────────────────────────────────────────────────────

export type AdminOverview = {
  total_views:           number
  total_contacts:        number
  new_users:             number
  published_properties:  number
  conversion_rate:       number
  period_days:           number
}

export type AdminTopProperty = {
  id:               number
  title:            string
  price:            number
  transaction_type: TransactionType
  property_type:    PropertyType
  status:           PropertyStatus
  views_total:      number
  views_unique:     number
}

export type AdminTopCity = {
  id:                   number
  name:                 string
  slug:                 string
  views_total:          number
  contacts_count:       number
  properties_published: number
  demand_supply_ratio:  number
}

export type AdminFunnel = {
  views:            number
  contacts:         number
  closed:           number
  view_to_contact:  number
  contact_to_close: number
  period_days:      number
}

export const adminAnalyticsApi = {
  overview:           ()                     => api.get<AdminOverview>('/admin/analytics/overview'),
  topProperties:      ()                     => api.get<AdminTopProperty[]>('/admin/analytics/top-properties'),
  topCities:          ()                     => api.get<AdminTopCity[]>('/admin/analytics/top-cities'),
  funnel:             ()                     => api.get<AdminFunnel>('/admin/analytics/funnel'),
  estimationDataset:  (page = 1)            => api.get<Paginated<Record<string, unknown>>>('/admin/analytics/estimation-dataset', { params: { page } }),
  marketInsights:     ()                     => api.get<MarketInsight[]>('/admin/analytics/market-insights'),
  searchTrends:       ()                     => api.get('/admin/analytics/search-trends'),
  sessionStats:       ()                     => api.get<SessionStats>('/admin/analytics/sessions'),
  geoBreakdown:       ()                     => api.get<GeoBreakdown>('/admin/analytics/geo-breakdown'),
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export type AdminUserFilters = {
  page?: number
  per_page?: number
  search?: string
}

export type AdminCreateUserPayload = {
  name: string
  email: string
  password: string
  role: UserRole
}

export const adminApi = {
  properties:     (params?: AdminFilters)                          => api.get<Paginated<Property>>('/admin/properties', { params }),
  updateProperty: (id: string, data: Partial<PropertyPayload>)    => api.patch<Property>(`/admin/properties/${id}`, data),
  deleteProperty: (id: string)                                     => api.delete(`/admin/properties/${id}`),
  users:          (params?: AdminUserFilters)                      => api.get<Paginated<User>>('/admin/users', { params }),
  updateUser:     (id: string, data: { role?: UserRole })         => api.patch<User>(`/admin/users/${id}`, data),
  deleteUser:     (id: string)                                     => api.delete(`/admin/users/${id}`),
  createUser:     (data: AdminCreateUserPayload)                   => api.post<User>('/admin/users', data),
  stats:          ()                                               => api.get<{ total_properties: number; published: number; drafts: number; total_users: number }>('/admin/stats'),
}
