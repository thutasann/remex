import * as React from 'react'
import { useRemexContext } from '../core'
import { RenderInfo } from '../types/performance.type'
import { generateUniqueId } from '../utils/id'

/**
 * Options for the useComponentMetrics hook
 */
type UseComponentMetricsOptions = {
  /** Component name for tracking */
  componentName?: string

  /** Update interval in milliseconds */
  updateInterval?: number
}

/**
 * Hook for accessing component performance metrics
 */
export function useComponentMetrics(options: UseComponentMetricsOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { componentName = 'Component', updateInterval = 1000 } = options

  const { performanceTracker, config } = useRemexContext()
  const componentId = React.useRef(`component-metrics-${generateUniqueId()}`)
  const [metrics, setMetrics] = React.useState<RenderInfo | null>(null)

  // Effect to periodically update metrics
  React.useEffect(() => {
    if (!performanceTracker || !config.trackRenders) {
      return
    }

    // Get initial metrics
    const info = performanceTracker.getComponentRenderInfo(componentId.current)
    if (info) {
      setMetrics(info)
    }

    // Set up interval for updates
    const intervalId = setInterval(() => {
      const info = performanceTracker.getComponentRenderInfo(componentId.current)
      if (info) {
        setMetrics(info)
      }
    }, updateInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [performanceTracker, config.trackRenders, updateInterval])

  return metrics
}
