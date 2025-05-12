import { MemorySnapshot } from './memory.type'
import { PerformanceEvent } from './performance.type'

/**
 * Event types that can be emitted by Remex
 */
export type RemexEventType =
  | 'memory-snapshot'
  | 'render-event'
  | 'heap-snapshot'
  | 'config-change'
  | 'profiler-start'
  | 'profiler-stop'
  | 'devtools-connected'
  | 'devtools-disconnected'

/**
 * Base event interface
 */
export type RemexEvent<T = unknown> = {
  /** Type of event */
  type: RemexEventType

  /** Timestamp when the event occurred */
  timestamp: number

  /** Event payload */
  payload: T
}

/**
 * Memory snapshot event
 */
export type MemorySnapshotEvent = RemexEvent<MemorySnapshot>

/**
 * Performance event wrapper
 */
export type PerformanceTrackingEvent = RemexEvent<PerformanceEvent>

/**
 * Event listener function type
 */
export type RemexEventListener<T = unknown> = (event: RemexEvent<T>) => void

/**
 * Event emitter interface
 */
export type RemexEventEmitter = {
  /** Add event listener */
  on: <T>(eventType: RemexEventType, listener: RemexEventListener<T>) => void

  /** Remove event listener */
  off: <T>(eventType: RemexEventType, listener: RemexEventListener<T>) => void

  /** Emit an event */
  emit: <T>(event: RemexEvent<T>) => void

  /** Remove all listeners */
  removeAllListeners: () => void
}
