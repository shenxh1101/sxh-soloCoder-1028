import React, { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { useTravelStore } from '@/store/travelStore'
import { mockDestinations } from '@/data/mockDestinations'
import { mockItineraries } from '@/data/mockItineraries'
import { mockExpenses, mockBudget } from '@/data/mockExpenses'
import { mockChecklist } from '@/data/mockChecklist'
import { mockJournals } from '@/data/mockJournals'
import './app.scss'

function App(props) {
  const { initialize, isInitialized } = useTravelStore()

  useEffect(() => {
    if (!isInitialized) {
      console.log('[App] Initializing travel store with mock data')
      initialize({
        places: mockDestinations,
        itinerary: mockItineraries,
        expenses: mockExpenses,
        budget: mockBudget,
        checklist: mockChecklist,
        journals: mockJournals
      })
    }
  }, [isInitialized, initialize])

  useDidShow(() => {})

  useDidHide(() => {})

  return props.children
}

export default App
