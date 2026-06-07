import React, { createContext, useContext, useState } from 'react'
import type { Screen } from '../types'

interface NavContextValue {
  screen: Screen
  params: Record<string, string>
  navigate: (screen: Screen, params?: Record<string, string>) => void
  goBack: () => void
  history: Array<{ screen: Screen; params: Record<string, string> }>
}

const NavContext = createContext<NavContextValue | null>(null)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<Array<{ screen: Screen; params: Record<string, string> }>>([
    { screen: 'library', params: {} }
  ])

  const current = history[history.length - 1]

  const navigate = (screen: Screen, params: Record<string, string> = {}) => {
    setHistory(prev => [...prev, { screen, params }])
  }

  const goBack = () => {
    if (history.length > 1) setHistory(prev => prev.slice(0, -1))
  }

  return (
    <NavContext.Provider value={{ screen: current.screen, params: current.params, navigate, goBack, history }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be inside NavProvider')
  return ctx
}
