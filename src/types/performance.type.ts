/**
 * Reasons for a component to re-render
 */
export type RenderReason =
  | 'props-change'
  | 'state-change'
  | 'hooks-change'
  | 'context-change'
  | 'parent-render'
  | 'force-update'
  | 'memo-failure'
  | 'unknown'

/**
 * Metrics for a component's render
 */
export type RenderMetrics = {
  /** Unique identifier for the render metrics */
  id: string

  /** Name of the component that rendered */
  componentName: string

  /** Time When render started (high-resolution timestamp) */
  startTime: number

  /** Time When render ended (high-resolution timestamp) */
  endTime: number

  /** Total render duration in milliseconds */
  duration: number

  /** Whether this was the initial render */
  isInitialRender: boolean

  /** Reason for the re-render */
  renderReason?: RenderReason

  /** Props that changed causing the render */
  changedProps?: string[]

  /** Whether the render could have been avoided */
  isAvoidable?: boolean
}

/**
 * Render information for a component
 */
export type RenderInfo = {
  /** Component identifier */
  componentId: string

  /** Component display name */
  displayName: string

  /** Total number of renders */
  renderCount: number

  /** Average render duration in milliseconds */
  averageRenderTime: number

  /** Maximum render duration in milliseconds */
  maxRenderTime: number

  /** Minimum render duration in milliseconds */
  minRenderTime: number

  /** Timestamp of the first render */
  firstRenderTime: number

  /** Timestamp of the last render */
  lastRenderTime: number

  /** History of render metrics */
  renderHistory: RenderMetrics[]

  /** Estimated wasted renders */
  wastedRenders: number
}

/**
 * Performance event types
 */
export type PerformanceEventType =
  | 'render-start'
  | 'render-complete'
  | 'effect-start'
  | 'effect-complete'
  | 'interaction-start'
  | 'interaction-complete'

/**
 * Performance event data
 */
export type PerformanceEvent = {
  /** Unique event identifier */
  id: string

  /** Type of performance event */
  type: PerformanceEventType

  /** Component associated with the event */
  componentId?: string

  /** Timestamp when the event occurred */
  timestamp: number

  /** Duration of the event in milliseconds (if applicable) */
  duration?: number

  /** Additional event metadata */
  metadata?: Record<string, unknown>
}

/**
 * User interaction tracking
 */
export type InteractionMetrics = {
  /** Unique interaction identifier */
  id: string

  /** Type of interaction (click, input, etc.) */
  type: string

  /** Element that received the interaction */
  targetElement: string

  /** Start time of the interaction */
  startTime: number

  /** End time of the interaction */
  endTime: number

  /** Total duration in milliseconds */
  duration: number

  /** Components that rendered as a result */
  affectedComponents: string[]
}
