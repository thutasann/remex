import React, { useEffect, useRef, useState } from 'react'
import { componentMemoryTracker, useRemexContext } from '../core'
import { MemoryProfilerProps } from '../types/components.type'
import { generateUniqueId } from '../utils/id'

/**
 * Memory Profiler Context
 */
export const MemoryProfilerContext = React.createContext<{
  shallowSize: number
  retainedSize: number
} | null>(null)

/**
 * Memory Profiler Component
 * Tracks memory usage of its children
 */
export function MemoryProfiler({ children, id, enabled = true, onSnapshot }: MemoryProfilerProps): JSX.Element {
  const { memoryTracker, config } = useRemexContext()
  const componentId = useRef(id || `memory-profiler-${generateUniqueId()}`)
  const [memoryUsage, setMemoryUsage] = useState<{
    shallowSize: number
    retainedSize: number
  } | null>(null)

  useEffect(() => {
    if (!enabled || !config.trackMemory) return

    componentMemoryTracker.registerComponent(componentId.current, id || MemoryProfiler.name, children)

    if (memoryTracker) memoryTracker.registerComponent(componentId.current, id || MemoryProfiler.name)

    const intervalId = setInterval(() => {
      const usage = componentMemoryTracker.getComponentMemoryUsage(componentId.current)

      if (usage) {
        setMemoryUsage({
          shallowSize: usage.shallowSize,
          retainedSize: usage.retainedSize,
        })

        if (onSnapshot) {
          onSnapshot(componentId.current, usage.shallowSize, usage.retainedSize)
        }
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
      componentMemoryTracker.unregisterComponent(componentId.current)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (memoryTracker) memoryTracker.unregisterComponent(componentId.current)
    }
  }, [enabled, memoryTracker, config.trackMemory, children, id, onSnapshot])

  return <MemoryProfilerContext.Provider value={memoryUsage}>{children}</MemoryProfilerContext.Provider>
}

/**
 * Hook to use Component Memory Usage
 * @returns Component Memory Usage
 */
export function useComponentMemoryUsage() {
  if (!MemoryProfilerContext) {
    throw new Error('MemoryProfilerContext not found')
  }

  return React.useContext(MemoryProfilerContext)
}
