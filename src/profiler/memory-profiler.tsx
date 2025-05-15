import * as React from 'react'
import { generateUniqueId, MemoryProfilerProps, useRemexContext } from '..'

/**
 * Memory Profiler Component
 * Tracks memory usage of its children
 */
export function MemoryProfiler({ children, id, enabled = true, onSnapshot }: MemoryProfilerProps) {
  const { memoryTracker, config } = useRemexContext()
  const componentId = React.useRef(id || `memory-profilder-${generateUniqueId()}`)

  // Register component on mount
  React.useEffect(() => {
    if (!enabled || !memoryTracker || !config.trackMemory) {
      return
    }

    memoryTracker.registerComponent(componentId.current, 'MemoryProfiler')

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      memoryTracker.unregisterComponent(componentId.current)
    }
  }, [enabled, memoryTracker, config.trackMemory])

  // Set up snapshot callback
  React.useEffect(() => {
    if (!enabled || !memoryTracker || !config.trackMemory || !onSnapshot) {
      return
    }

    const intervalId = setInterval(() => {
      const usage = memoryTracker.getComponentMemoryUsage(componentId.current)

      if (usage) {
        onSnapshot(componentId.current, usage.shallowSize, usage.retainedSize)
      }
    }, config.memorySamplingRate)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, memoryTracker, config, onSnapshot])

  return <>{children}</>
}
