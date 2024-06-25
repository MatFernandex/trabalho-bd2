import { type StateStorage } from 'zustand/middleware'

export const stateStorage = (): StateStorage => ({
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key “${name}”:`, error)
    }
  },
  getItem: (name) => {
    try {
      const item = window.localStorage.getItem(name)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting localStorage key “${name}”:`, error)
      return null
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch (error) {
      console.error(`Error removing localStorage key “${name}”:`, error)
    }
  },
})
