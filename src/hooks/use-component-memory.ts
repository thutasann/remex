import { useComponentMemoryUsage } from 'profiler'
import { useEffect, useState } from 'react'

type ComponentMemoryMetrics = {
  shallowSize: number
  retainedSize: number
  history: Array<{
    timestamp: number
    shallowSize: number
    retainedSize: number
  }>
}

/**
 * Hook for monitoring component-specific memory usage
 */
export function useComponentMemory() {
  const [metrics, setMetrics] = useState<ComponentMemoryMetrics>({
    shallowSize: 0,
    retainedSize: 0,
    history: [],
  })

  /** Get memory usage from nearest MemoryProfiler */
  const profiledMemory = useComponentMemoryUsage()

  // Update metrics when profiled memory changes
  useEffect(() => {
    if (profiledMemory) {
      setMetrics((prev) => {
        const newHistory = [
          ...prev.history,
          {
            timestamp: Date.now(),
            shallowSize: profiledMemory.shallowSize,
            retainedSize: profiledMemory.retainedSize,
          },
        ]

        // Keep only the last 60 entries
        if (newHistory.length > 60) {
          newHistory.shift()
        }

        return {
          shallowSize: profiledMemory.shallowSize,
          retainedSize: profiledMemory.retainedSize,
          history: newHistory,
        }
      })
    }
  }, [profiledMemory])

  return metrics
}
