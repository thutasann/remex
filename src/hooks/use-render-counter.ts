import * as React from 'react'
import { generateUniqueId, useRemexContext } from '..'

/**
 * Options for the useRenderCounter hook
 */
type UseRenderCounterOptions = {
  /** Component name for tracking */
  componentName?: string

  /** Whether to log renders to console */
  logToConsole?: boolean
}

/**
 * Hook for counting component renders
 */
export function useRenderCounter(options: UseRenderCounterOptions = {}) {
  const { componentName = 'Component', logToConsole = false } = options

  const { performanceTracker, config } = useRemexContext()
  const renderCount = React.useRef(0)
  const componentId = React.useRef(`render-counter-${generateUniqueId()}`)
  const renderId = React.useRef<string | null>(null)

  // Track render start
  React.useEffect(() => {
    renderCount.current += 1

    if (performanceTracker && config.trackRenders) {
      renderId.current = performanceTracker.trackRenderStart(
        componentId.current,
        componentName,
        renderCount.current === 1
      )
    }

    if (logToConsole) {
      // eslint-disable-next-line no-console
      console.log(`[Remex] ${componentName} rendered ${renderCount.current} times`)
    }

    // Track render complete in next microtask
    Promise.resolve().then(() => {
      if (performanceTracker && config.trackRenders && renderId.current) {
        performanceTracker.trackRenderComplete(componentId.current, renderId.current, [])
        renderId.current = null
      }
    })
  })

  return renderCount.current
}
