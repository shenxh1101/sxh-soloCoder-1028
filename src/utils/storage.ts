import Taro from '@tarojs/taro'

const STORAGE_KEYS = {
  PLACES: 'travel_places',
  ITINERARY: 'travel_itinerary',
  EXPENSES: 'travel_expenses',
  BUDGET: 'travel_budget',
  CHECKLIST: 'travel_checklist',
  JOURNALS: 'travel_journals',
  TRIP_MEMBERS: 'travel_members',
  HAS_DATA: 'travel_has_data',
  CURRENT_CURRENCY: 'travel_currency'
}

export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const res = await Taro.getStorage({ key })
      return res.data !== '' ? JSON.parse(res.data) : defaultValue
    } catch (e) {
      return defaultValue
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Taro.setStorage({
        key,
        data: JSON.stringify(value)
      })
    } catch (e) {
      console.error('[Storage] Failed to set', key, e)
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Taro.removeStorage({ key })
    } catch (e) {
      console.error('[Storage] Failed to remove', key, e)
    }
  },

  async hasData(): Promise<boolean> {
    try {
      const res = await Taro.getStorage({ key: STORAGE_KEYS.HAS_DATA })
      return res.data === 'true'
    } catch (e) {
      return false
    }
  },

  async setHasData(value: boolean): Promise<void> {
    await Taro.setStorage({
      key: STORAGE_KEYS.HAS_DATA,
      data: String(value)
    })
  }
}

export { STORAGE_KEYS }
