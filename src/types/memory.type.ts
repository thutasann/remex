/**
 * Memory metrics tracked by Remex
 */
export type MemoryMetrics = {
  /** Total JS heap size in bytes */
  totalJSHeapSize: number

  /** JS heap size used in bytes */
  usedJSHeapSize: number

  /** JS heap size limit in bytes */
  jsHeapSizeLimit: number

  /** Timestamp when the metrics were captured */
  timestamp: number
}

/**
 * Memory snapshot with detailed information
 */
export type MemorySnapshot = {
  /** Unique identifier for the snapshot */
  id: string

  /** Basic memory metrics */
  metrics: MemoryMetrics

  /** Component-specific memory usage if available */
  componentBreakdown?: ComponentMemoryUsage[]

  /** Custom labels for the snapshot */
  labels?: Record<string, string>

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Type of the node in the heap snapshot
 */
export type HeapNodeType =
  | 'object'
  | 'native'
  | 'code'
  | 'closure'
  | 'synthetic'
  | 'concatenated string'
  | 'sliced string'
  | 'array'
  | 'regexp'

/**
 * Memory usage for a specific component
 */
export type ComponentMemoryUsage = {
  /** Component name or identifier */
  componentId: string

  /** Component display name */
  displayName: string

  /** Estimated shallow size in bytes */
  shallowSize: number

  /** Estimated retained size in bytes */
  retainedSize: number

  /** Number of instances of this component */
  instanceCount: number
}

/**
 * Heap snapshot node representing an object in memory
 */
export type HeapNode = {
  /** Node identifier */
  id: number

  /** Node name (constructor name) */
  name: string

  /** Self size in bytes */
  selfSize: number

  /** Retained size in bytes */
  retainedSize: number

  /** Edge references to other nodes */
  edges?: HeapEdge[]

  /** Type of the node */
  type: HeapNodeType
}

/**
 * Edge in the heap snapshot graph
 */
export type HeapEdge = {
  /** Edge name/label */
  name: string

  /** Type of reference */
  type: 'context' | 'element' | 'property' | 'internal' | 'hidden' | 'shortcut' | 'weak'

  /** Target node ID */
  toNode: number
}

/**
 * Complete heap snapshot
 */
export type HeapSnapshot = {
  /** Unique identifier for the snapshot */
  id: string

  /** Timestamp when the snapshot was taken */
  timestamp: number

  /** Nodes in the heap graph */
  nodes: HeapNode[]

  /** Root node IDs */
  rootNodeIds: number[]

  /** Total number of objects */
  objectCount: number

  /** Memory metrics at the time of snapshot */
  metrics: MemoryMetrics
}
