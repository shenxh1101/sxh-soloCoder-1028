import { create } from 'zustand'
import type {
  Place,
  ItineraryItem,
  Expense,
  Budget,
  ChecklistItem,
  JournalEntry,
  PlaceCategory,
  Currency,
  ChecklistCategory
} from '@/types/travel'
import { storage, STORAGE_KEYS } from '@/utils/storage'

interface TravelState {
  places: Place[]
  itinerary: ItineraryItem[]
  expenses: Expense[]
  budget: Budget
  checklist: ChecklistItem[]
  journals: JournalEntry[]
  tripMembers: string[]
  selectedPlaceCategory: PlaceCategory
  selectedDate: string
  displayCurrency: Currency
  isInitialized: boolean
  isLoading: boolean

  initialize: (mockData?: {
    places?: Place[]
    itinerary?: ItineraryItem[]
    expenses?: Expense[]
    budget?: Budget
    checklist?: ChecklistItem[]
    journals?: JournalEntry[]
  }) => Promise<void>

  saveAll: () => Promise<void>

  addPlace: (place: Omit<Place, 'id' | 'createdAt'>) => void
  updatePlace: (id: string, updates: Partial<Place>) => void
  removePlace: (id: string) => void
  setPlaceCategory: (category: PlaceCategory) => void

  addItineraryItem: (item: Omit<ItineraryItem, 'id'>) => void
  removeItineraryItem: (id: string) => void
  updateItineraryItem: (id: string, updates: Partial<ItineraryItem>) => void
  reorderItinerary: (date: string, timeSlot: string, items: ItineraryItem[]) => void
  setSelectedDate: (date: string) => void
  checkConflicts: (date: string) => void

  addExpense: (expense: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void
  setBudget: (total: number, currency: Currency) => void
  setDisplayCurrency: (currency: Currency) => void

  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void
  removeChecklistItem: (id: string) => void
  toggleChecklistItem: (id: string) => void

  addJournal: (journal: Omit<JournalEntry, 'id'>) => void
  updateJournal: (id: string, updates: Partial<JournalEntry>) => void
  removeJournal: (id: string) => void

  addTripMember: (name: string) => void
  removeTripMember: (name: string) => void

  clearAllData: () => Promise<void>
}

export const useTravelStore = create<TravelState>((set, get) => ({
  places: [],
  itinerary: [],
  expenses: [],
  budget: { total: 10000, currency: 'CNY', spent: 0 },
  checklist: [],
  journals: [],
  tripMembers: ['我', '同伴1', '同伴2', '同伴3'],
  selectedPlaceCategory: 'attraction',
  selectedDate: new Date().toISOString().split('T')[0],
  displayCurrency: 'CNY',
  isInitialized: false,
  isLoading: false,

  initialize: async (mockData) => {
    console.log('[TravelStore] Initializing...')
    set({ isLoading: true })

    const hasData = await storage.hasData()
    console.log('[TravelStore] Has existing data:', hasData)

    if (hasData) {
      const [places, itinerary, expenses, budget, checklist, journals, tripMembers, displayCurrency] = await Promise.all([
        storage.get<Place[]>(STORAGE_KEYS.PLACES, []),
        storage.get<ItineraryItem[]>(STORAGE_KEYS.ITINERARY, []),
        storage.get<Expense[]>(STORAGE_KEYS.EXPENSES, []),
        storage.get<Budget>(STORAGE_KEYS.BUDGET, { total: 10000, currency: 'CNY', spent: 0 }),
        storage.get<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, []),
        storage.get<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []),
        storage.get<string[]>(STORAGE_KEYS.TRIP_MEMBERS, ['我', '同伴1', '同伴2', '同伴3']),
        storage.get<Currency>(STORAGE_KEYS.CURRENT_CURRENCY, 'CNY')
      ])

      set({
        places,
        itinerary,
        expenses,
        budget,
        checklist,
        journals,
        tripMembers,
        displayCurrency,
        isInitialized: true,
        isLoading: false
      })
      console.log('[TravelStore] Loaded from storage')
    } else if (mockData) {
      const initialBudget = mockData.budget || { total: 10000, currency: 'CNY', spent: 0 }

      set({
        places: mockData.places || [],
        itinerary: mockData.itinerary || [],
        expenses: mockData.expenses || [],
        budget: initialBudget,
        checklist: mockData.checklist || [],
        journals: mockData.journals || [],
        isInitialized: true,
        isLoading: false
      })

      await get().saveAll()
      await storage.setHasData(true)
      console.log('[TravelStore] Initialized with mock data and saved')
    } else {
      set({ isInitialized: true, isLoading: false })
      console.log('[TravelStore] Initialized empty')
    }
  },

  saveAll: async () => {
    const state = get()
    await Promise.all([
      storage.set(STORAGE_KEYS.PLACES, state.places),
      storage.set(STORAGE_KEYS.ITINERARY, state.itinerary),
      storage.set(STORAGE_KEYS.EXPENSES, state.expenses),
      storage.set(STORAGE_KEYS.BUDGET, state.budget),
      storage.set(STORAGE_KEYS.CHECKLIST, state.checklist),
      storage.set(STORAGE_KEYS.JOURNALS, state.journals),
      storage.set(STORAGE_KEYS.TRIP_MEMBERS, state.tripMembers),
      storage.set(STORAGE_KEYS.CURRENT_CURRENCY, state.displayCurrency)
    ])
    console.log('[TravelStore] All data saved to storage')
  },

  addPlace: (place) => {
    console.log('[TravelStore] Adding place:', place.name)
    const newPlace = {
      ...place,
      id: `place-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    set((state) => ({
      places: [newPlace, ...state.places]
    }))
    get().saveAll()
  },

  updatePlace: (id, updates) => {
    console.log('[TravelStore] Updating place:', id, updates)
    set((state) => ({
      places: state.places.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    }))
    get().saveAll()
  },

  removePlace: (id) => {
    console.log('[TravelStore] Removing place:', id)
    set((state) => ({
      places: state.places.filter((p) => p.id !== id)
    }))
    get().saveAll()
  },

  setPlaceCategory: (category) => {
    console.log('[TravelStore] Setting place category:', category)
    set({ selectedPlaceCategory: category })
  },

  addItineraryItem: (item) => {
    console.log('[TravelStore] Adding itinerary item:', item.title)
    const newItem = { ...item, id: `itinerary-${Date.now()}` }
    set((state) => ({
      itinerary: [...state.itinerary, newItem]
    }))
    get().checkConflicts(item.date)
    get().saveAll()
  },

  removeItineraryItem: (id) => {
    console.log('[TravelStore] Removing itinerary item:', id)
    const item = get().itinerary.find((i) => i.id === id)
    set((state) => ({
      itinerary: state.itinerary.filter((i) => i.id !== id)
    }))
    if (item) {
      get().checkConflicts(item.date)
    }
    get().saveAll()
  },

  updateItineraryItem: (id, updates) => {
    console.log('[TravelStore] Updating itinerary item:', id, updates)
    set((state) => ({
      itinerary: state.itinerary.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      )
    }))
    const item = get().itinerary.find((i) => i.id === id)
    if (item) {
      get().checkConflicts(item.date)
    }
    get().saveAll()
  },

  reorderItinerary: (date, timeSlot, items) => {
    console.log('[TravelStore] Reordering itinerary:', date, timeSlot)
    set((state) => {
      const otherItems = state.itinerary.filter(
        (i) => !(i.date === date && i.timeSlot === timeSlot)
      )
      return { itinerary: [...otherItems, ...items] }
    })
    get().checkConflicts(date)
    get().saveAll()
  },

  setSelectedDate: (date) => {
    console.log('[TravelStore] Setting selected date:', date)
    set({ selectedDate: date })
  },

  checkConflicts: (date) => {
    console.log('[TravelStore] Checking conflicts for date:', date)
    set((state) => {
      const dayItems = state.itinerary.filter((i) => i.date === date)
      const updated = state.itinerary.map((item) => {
        if (item.date !== date) return item
        const hasConflict = dayItems.some((other) => {
          if (other.id === item.id) return false
          const start1 = item.startTime
          const end1 = item.endTime
          const start2 = other.startTime
          const end2 = other.endTime
          return (start1 < end2 && end1 > start2)
        })
        return { ...item, hasConflict }
      })
      return { itinerary: updated }
    })
  },

  addExpense: (expense) => {
    console.log('[TravelStore] Adding expense:', expense.description, expense.amount)
    set((state) => ({
      expenses: [{ ...expense, id: `expense-${Date.now()}` }, ...state.expenses]
    }))
    get().saveAll()
  },

  removeExpense: (id) => {
    console.log('[TravelStore] Removing expense:', id)
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id)
    }))
    get().saveAll()
  },

  setBudget: (total, currency) => {
    console.log('[TravelStore] Setting budget:', total, currency)
    set((state) => ({
      budget: { ...state.budget, total, currency }
    }))
    get().saveAll()
  },

  setDisplayCurrency: (currency) => {
    console.log('[TravelStore] Setting display currency:', currency)
    set({ displayCurrency: currency })
    get().saveAll()
  },

  addChecklistItem: (item) => {
    console.log('[TravelStore] Adding checklist item:', item.name)
    set((state) => ({
      checklist: [{ ...item, id: `checklist-${Date.now()}` }, ...state.checklist]
    }))
    get().saveAll()
  },

  removeChecklistItem: (id) => {
    console.log('[TravelStore] Removing checklist item:', id)
    set((state) => ({
      checklist: state.checklist.filter((i) => i.id !== id)
    }))
    get().saveAll()
  },

  toggleChecklistItem: (id) => {
    console.log('[TravelStore] Toggling checklist item:', id)
    set((state) => ({
      checklist: state.checklist.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      )
    }))
    get().saveAll()
  },

  addJournal: (journal) => {
    console.log('[TravelStore] Adding journal:', journal.title)
    set((state) => ({
      journals: [{ ...journal, id: `journal-${Date.now()}` }, ...state.journals]
    }))
    get().saveAll()
  },

  updateJournal: (id, updates) => {
    console.log('[TravelStore] Updating journal:', id, updates)
    set((state) => ({
      journals: state.journals.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      )
    }))
    get().saveAll()
  },

  removeJournal: (id) => {
    console.log('[TravelStore] Removing journal:', id)
    set((state) => ({
      journals: state.journals.filter((j) => j.id !== id)
    }))
    get().saveAll()
  },

  addTripMember: (name) => {
    console.log('[TravelStore] Adding trip member:', name)
    set((state) => {
      if (state.tripMembers.includes(name)) return state
      return {
        tripMembers: [...state.tripMembers, name]
      }
    })
    get().saveAll()
  },

  removeTripMember: (name) => {
    console.log('[TravelStore] Removing trip member:', name)
    set((state) => ({
      tripMembers: state.tripMembers.filter((m) => m !== name)
    }))
    get().saveAll()
  },

  clearAllData: async () => {
    console.log('[TravelStore] Clearing all data')
    await Promise.all([
      storage.remove(STORAGE_KEYS.PLACES),
      storage.remove(STORAGE_KEYS.ITINERARY),
      storage.remove(STORAGE_KEYS.EXPENSES),
      storage.remove(STORAGE_KEYS.BUDGET),
      storage.remove(STORAGE_KEYS.CHECKLIST),
      storage.remove(STORAGE_KEYS.JOURNALS),
      storage.remove(STORAGE_KEYS.TRIP_MEMBERS),
      storage.remove(STORAGE_KEYS.HAS_DATA),
      storage.remove(STORAGE_KEYS.CURRENT_CURRENCY)
    ])
    set({
      places: [],
      itinerary: [],
      expenses: [],
      budget: { total: 10000, currency: 'CNY', spent: 0 },
      checklist: [],
      journals: [],
      tripMembers: ['我', '同伴1', '同伴2', '同伴3'],
      isInitialized: false
    })
  }
}))
