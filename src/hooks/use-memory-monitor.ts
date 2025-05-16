import * as React from 'react'
import { MemoryMetrics, useRemexContext } from '..'

/**
 * Options for the useMemoryMonitor hook
 */
type UseMemoryMonitorOptions = {
  /** Sampling interval in milliseconds */
  interval?: number

  /** Maximum number of samples to keep */
  maxSamples?: number

  /** Whether to start monitoring immediately */
  autoStart?: boolean
}

/**
 * Hook for monitoring memory usage in a component
 */
export function useMemoryMonitor(options: UseMemoryMonitorOptions = {}) {
  const { interval = 2000, maxSamples = 60, autoStart = true } = options

  const { memoryTracker, config } = useRemexContext()
  const [isMonitoring, setIsMonitoring] = React.useState(autoStart)
  const [metrics, setMetrics] = React.useState<MemoryMetrics | null>(null)
  const [history, setHistory] = React.useState<MemoryMetrics[]>([])

  const startMonitoring = () => setIsMonitoring(true)
  const stopMonitoring = () => setIsMonitoring(false)

  // Clear history
  const clearHistory = () => setHistory([])

  // Effect for monitoring memory
  React.useEffect(() => {
    if (!isMonitoring || !memoryTracker || !config.trackMemory) {
      return
    }

    // Take initial snapshot
    const initialSnapshot = memoryTracker.takeSnapshot()
    if (initialSnapshot) {
      setMetrics(initialSnapshot.metrics)
      setHistory((prev) => {
        const updated = [...prev, initialSnapshot.metrics]
        return updated.slice(-maxSamples)
      })
    }

    // Set up interval for regular snapshots
    const intervalId = setInterval(() => {
      const snapshot = memoryTracker.takeSnapshot()

      if (snapshot) {
        setMetrics(snapshot.metrics)
        setHistory((prev) => {
          const updated = [...prev, snapshot.metrics]
          return updated.slice(-maxSamples)
        })
      }
    }, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [isMonitoring, memoryTracker, config.trackMemory, interval, maxSamples])

  return {
    metrics,
    history,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearHistory,
  }
}
