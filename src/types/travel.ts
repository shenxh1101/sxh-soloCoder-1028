export type PlaceCategory = 'attraction' | 'hotel' | 'restaurant' | 'transport'

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  address: string
  description: string
  rating?: number
  image: string
  latitude?: number
  longitude?: number
  createdAt: string
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export interface ItineraryItem {
  id: string
  title: string
  description?: string
  date: string
  timeSlot: TimeSlot
  startTime: string
  endTime: string
  location?: string
  placeId?: string
  hasConflict?: boolean
  order: number
}

export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP'

export interface Expense {
  id: string
  amount: number
  currency: Currency
  category: string
  description: string
  date: string
  splitAmong: string[]
  paidBy: string
}

export interface Budget {
  total: number
  currency: Currency
  spent: number
}

export type ChecklistCategory = 'documents' | 'clothing' | 'medicine' | 'electronics' | 'other'

export interface ChecklistItem {
  id: string
  name: string
  category: ChecklistCategory
  checked: boolean
  quantity?: number
  note?: string
}

export interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  images: string[]
  location?: string
  rating: number
  latitude?: number
  longitude?: number
  weather?: string
  mood?: string
}

export interface TripSummary {
  id: string
  title: string
  startDate: string
  endDate: string
  totalDays: number
  totalExpense: number
  placesVisited: number
  avgRating: number
  journalCount: number
  coverImage: string
}
