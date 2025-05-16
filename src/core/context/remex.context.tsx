import * as React from 'react'
import { RemexOptions } from '../../types'
import {
  getConfig,
  getMemoryTracker,
  getPerformanceTracker,
  initRemex,
  MemoryTracker,
  PerformanceTracker,
  resetRemex,
  updateConfig,
} from '../lib'

/**
 * ## Remex Context Type
 * @description This type is used to store the Remex context.
 */
type RemexContextType = {
  /** Memory Tracker Instance */
  memoryTracker: MemoryTracker | null
  /** Performance Tracker Instance */
  performanceTracker: PerformanceTracker | null
  /** Remex Options Configs */
  config: RemexOptions
  /** Update Remex Options Config */
  updateConfig: (options: Partial<RemexOptions>) => void
  /** Whether the Remex is initialized or not */
  isInitialized: boolean
}

/**
 * ## Remext Context
 * @description This context is used to store the Remex context.
 */
const RemexContext = React.createContext<RemexContextType>({
  memoryTracker: null,
  performanceTracker: null,
  config: getConfig(),
  updateConfig: () => {},
  isInitialized: false,
})

/**
 * ## Remex Provider
 * @description This provider is used to provide the Remex context to the app.
 */
type RemexProviderProps = {
  children: React.ReactNode
  options?: Partial<RemexOptions>
}

/**
 * ## Remex Provider Component
 * Initializes Remex and provides context to child components
 * @author [thutasann](https://github.com/thutasann)
 * @version 0.0.1
 * @since 0.0.1
 */
export const RemexProvider = ({ children, options }: RemexProviderProps) => {
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Initialize on mount
  React.useEffect(() => {
    initRemex(options)
    setIsInitialized(true)

    return () => {
      resetRemex()
      setIsInitialized(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update config when options change
  React.useEffect(() => {
    if (isInitialized && options) {
      updateConfig(options)
    }
  }, [options, isInitialized])

  // Context value
  const contextValue: RemexContextType = React.useMemo(
    () => ({
      memoryTracker: getMemoryTracker(),
      performanceTracker: getPerformanceTracker(),
      config: getConfig(),
      updateConfig,
      isInitialized,
    }),
    [isInitialized]
  )

  return <RemexContext.Provider value={contextValue}>{children}</RemexContext.Provider>
}

/**
 * Hook to access Remex context
 * @description This hook is used to access the Remex context.
 * @author [thutasann](https://github.com/thutasann)
 * @version 0.0.1
 * @since 0.0.1
 */
export function useRemexContext(): RemexContextType {
  const context = React.useContext(RemexContext)

  if (context === undefined) {
    throw new Error('useRemexContext must be used within a RemexProvider')
  }

  return context
}
