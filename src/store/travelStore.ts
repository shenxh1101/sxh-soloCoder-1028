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

interface TravelState {
  places: Place[]
  itinerary: ItineraryItem[]
  expenses: Expense[]
  budget: Budget
  checklist: ChecklistItem[]
  journals: JournalEntry[]
  selectedPlaceCategory: PlaceCategory
  selectedDate: string

  addPlace: (place: Omit<Place, 'id' | 'createdAt'>) => void
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

  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void
  removeChecklistItem: (id: string) => void
  toggleChecklistItem: (id: string) => void

  addJournal: (journal: Omit<JournalEntry, 'id'>) => void
  removeJournal: (id: string) => void
}

export const useTravelStore = create<TravelState>((set, get) => ({
  places: [],
  itinerary: [],
  expenses: [],
  budget: { total: 10000, currency: 'CNY', spent: 0 },
  checklist: [],
  journals: [],
  selectedPlaceCategory: 'attraction',
  selectedDate: new Date().toISOString().split('T')[0],

  addPlace: (place) => {
    console.log('[TravelStore] Adding place:', place.name)
    set((state) => ({
      places: [
        {
          ...place,
          id: `place-${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...state.places
      ]
    }))
  },

  removePlace: (id) => {
    console.log('[TravelStore] Removing place:', id)
    set((state) => ({
      places: state.places.filter((p) => p.id !== id)
    }))
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
          if (other.timeSlot !== item.timeSlot) return false
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
      expenses: [{ ...expense, id: `expense-${Date.now()}` }, ...state.expenses],
      budget: {
        ...state.budget,
        spent: state.budget.spent + expense.amount
      }
    }))
  },

  removeExpense: (id) => {
    console.log('[TravelStore] Removing expense:', id)
    const expense = get().expenses.find((e) => e.id === id)
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
      budget: {
        ...state.budget,
        spent: expense ? state.budget.spent - expense.amount : state.budget.spent
      }
    }))
  },

  setBudget: (total, currency) => {
    console.log('[TravelStore] Setting budget:', total, currency)
    set((state) => ({
      budget: { ...state.budget, total, currency }
    }))
  },

  addChecklistItem: (item) => {
    console.log('[TravelStore] Adding checklist item:', item.name)
    set((state) => ({
      checklist: [{ ...item, id: `checklist-${Date.now()}` }, ...state.checklist]
    }))
  },

  removeChecklistItem: (id) => {
    console.log('[TravelStore] Removing checklist item:', id)
    set((state) => ({
      checklist: state.checklist.filter((i) => i.id !== id)
    }))
  },

  toggleChecklistItem: (id) => {
    console.log('[TravelStore] Toggling checklist item:', id)
    set((state) => ({
      checklist: state.checklist.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      )
    }))
  },

  addJournal: (journal) => {
    console.log('[TravelStore] Adding journal:', journal.title)
    set((state) => ({
      journals: [{ ...journal, id: `journal-${Date.now()}` }, ...state.journals]
    }))
  },

  removeJournal: (id) => {
    console.log('[TravelStore] Removing journal:', id)
    set((state) => ({
      journals: state.journals.filter((j) => j.id !== id)
    }))
  }
}))
