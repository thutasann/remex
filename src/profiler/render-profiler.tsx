import React, { Fragment, Profiler, useCallback, useRef } from 'react'
import { RenderProfilerProps, useRemexContext } from '..'

/**
 * Render Profiler Component
 * Tracks render times of its children using React's built-in Profiler
 */
export function RenderProfiler({ children, id, enabled = true, onRender }: RenderProfilerProps) {
  const { performanceTracker, config } = useRemexContext()
  const initialRenderRef = useRef(true)

  /**
   * Handle profiler onRender callback
   */
  const handleRender = useCallback(
    (profilerId: string, phase: 'mount' | 'update' | 'nested-update', actualDuration: number) => {
      if (onRender) {
        onRender(profilerId, phase, actualDuration)
      }

      // Track render in performance tracker
      if (enabled && performanceTracker && config.trackRenders) {
        const renderId = performanceTracker.trackRenderStart(profilerId, id, initialRenderRef.current)

        performanceTracker.trackRenderComplete(profilerId, renderId, [])

        if (initialRenderRef.current) {
          initialRenderRef.current = false
        }
      }
    },
    [enabled, performanceTracker, config.trackRenders, onRender, id]
  )

  if (!enabled || !config.trackRenders) return <Fragment>{children}</Fragment>

  return (
    <Profiler id={id} onRender={(id, phase, actualDuration) => handleRender(id, phase, actualDuration)}>
      {children}
    </Profiler>
  )
}
