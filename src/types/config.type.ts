/**
 * ## Main Configuration options for Remex
 * @description This is the main configuration object for Remex.
 * @author [thutasann](https://github.com/thutasann)
 * @version 0.0.1
 */
export type RemexOptions = {
  /** Whether to enable the profiler */
  enabled: boolean

  /** Whether to enable memory tracking */
  trackMemory: boolean

  /** Whether to enable render tracking */
  trackRenders: boolean

  /** Whether to enable heap snapshot analysis */
  trackHeapSnapshots: boolean

  /** Sampling rate for memory metrics (in ms) */
  memorySamplingRate: number

  /** Maximum number of memory snapshots to keep */
  maxMemorySnapshots: number

  /** Maximum number of render metrics to keep per component */
  maxRenderHistory: number

  /** Components to include in tracking (if empty, tracks all) */
  includeComponents?: string[]

  /** Components to exclude from tracking */
  excludeComponents?: string[]

  /** Whether to track avoidable renders */
  detectAvoidableRenders: boolean

  /** Whether to automatically connect to DevTools */
  connectToDevTools: boolean

  /** Custom logger implementation */
  logger?: RemexLogger
}

/**
 * Logger interface for Remex
 */
export type RemexLogger = {
  /** Log informational message */
  info: (message: string, ...args: unknown[]) => void

  /** Log warning message */
  warn: (message: string, ...args: unknown[]) => void

  /** Log error message */
  error: (message: string, ...args: unknown[]) => void

  /** Log debug message */
  debug: (message: string, ...args: unknown[]) => void
}
