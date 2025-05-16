/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeapEdge, HeapNode, HeapNodeType, HeapSnapshot, MemoryMetrics } from '@/types'
import { generateUniqueId } from '@/utils'

/**
 * Heap Snapshot Analyzer
 * Analyzes heap snapshots to identify memory issues
 */
export class HeapSnapshotAnalyzer {
  /**
   * Take a heap snapshot
   * @returns Promise resolving to a heap snapshot or null if not supported
   */
  public async takeSnapshot(): Promise<HeapSnapshot | null> {
    try {
      // Check if heap profiler is available (Chrome DevTools Protocol)
      if (!this.isHeapProfilerAvailable()) {
        console.warn('Heap profiler is not available in this environment')
        return null
      }

      // Capture a heap snapshot using Chrome DevTools Protocol
      const snapshotData = await this.captureHeapSnapshot()

      if (!snapshotData) {
        return null
      }

      return this.parseHeapSnapshot(snapshotData)
    } catch (error) {
      console.error('Failed to take heap snapshot:', error)
      return null
    }
  }

  /**
   * Find memory leaks in a heap snapshot
   * @param snapshot Heap snapshot to analyze
   * @returns Array of potential memory leak nodes
   */
  public findMemoryLeaks(snapshot: HeapSnapshot): HeapNode[] {
    const potentialLeaks: HeapNode[] = []

    // Look for detached DOM elements
    const detachedDomElements = this.findDetachedDomElements(snapshot)
    potentialLeaks.push(...detachedDomElements)

    // Look for nodes with large retained sizes
    const largeObjects = this.findLargeObjects(snapshot)
    potentialLeaks.push(...largeObjects)

    // Look for circular references that may cause leaks
    const circularReferences = this.findCircularReferences(snapshot)
    potentialLeaks.push(...circularReferences)

    // Look for unexpected object counts (potential leaks)
    const unexpectedObjectCounts = this.findUnexpectedObjectCounts(snapshot)
    potentialLeaks.push(...unexpectedObjectCounts)

    // Deduplicate nodes by ID
    const uniqueLeaks = new Map<number, HeapNode>()
    for (const node of potentialLeaks) {
      uniqueLeaks.set(node.id, node)
    }

    return Array.from(uniqueLeaks.values())
  }

  /**
   * Find components with excessive memory usage
   * @param snapshot Heap snapshot to analyze
   * @returns Map of component names to memory usage
   */
  public findComponentMemoryUsage(snapshot: HeapSnapshot): Map<string, number> {
    const componentUsage = new Map<string, number>()

    // Look for React component instances
    const reactComponentNodes = snapshot.nodes.filter(
      (node) =>
        node.name.includes('React') &&
        (node.name.includes('Component') || node.name.includes('Element') || node.name.includes('Fiber'))
    )

    // Group by component type
    for (const node of reactComponentNodes) {
      const componentName = this.extractComponentName(node.name)

      if (componentName) {
        const currentUsage = componentUsage.get(componentName) || 0
        componentUsage.set(componentName, currentUsage + node.retainedSize)
      }
    }

    // Also look for component instances in fiber nodes
    const fiberNodes = snapshot.nodes.filter((node) => node.name.includes('FiberNode') || node.name.includes('Fiber'))

    for (const node of fiberNodes) {
      // Try to identify component name from fiber node properties
      const componentNameFromFiber = this.extractComponentNameFromFiber(node, snapshot)

      if (componentNameFromFiber) {
        const currentUsage = componentUsage.get(componentNameFromFiber) || 0
        componentUsage.set(componentNameFromFiber, currentUsage + node.retainedSize)
      }
    }

    return componentUsage
  }

  /**
   * Compare two heap snapshots to find memory growth
   * @param before Snapshot taken before
   * @param after Snapshot taken after
   * @returns Object describing memory changes
   */
  public compareSnapshots(
    before: HeapSnapshot,
    after: HeapSnapshot
  ): {
    added: HeapNode[]
    removed: HeapNode[]
    changed: Array<{ before: HeapNode; after: HeapNode; growth: number }>
  } {
    const added: HeapNode[] = []
    const removed: HeapNode[] = []
    const changed: Array<{ before: HeapNode; after: HeapNode; growth: number }> = []

    // Create maps for faster lookups
    const beforeNodesMap = new Map<string, HeapNode>()
    const afterNodesMap = new Map<string, HeapNode>()

    // Use both ID and name as key since IDs might not be stable between snapshots
    for (const node of before.nodes) {
      beforeNodesMap.set(`${node.name}:${node.id}`, node)
    }

    for (const node of after.nodes) {
      afterNodesMap.set(`${node.name}:${node.id}`, node)

      // Check if this node exists in the before snapshot
      const key = `${node.name}:${node.id}`
      const beforeNode = beforeNodesMap.get(key)

      if (!beforeNode) {
        // Node is new in the after snapshot
        added.push(node)
      } else if (node.retainedSize !== beforeNode.retainedSize) {
        // Node exists in both snapshots but has changed size
        changed.push({
          before: beforeNode,
          after: node,
          growth: node.retainedSize - beforeNode.retainedSize,
        })
      }
    }

    // Find nodes that exist in before but not in after (removed)
    for (const node of before.nodes) {
      const key = `${node.name}:${node.id}`
      if (!afterNodesMap.has(key)) {
        removed.push(node)
      }
    }

    // Log summary
    console.log(`Memory growth: ${after.metrics.usedJSHeapSize - before.metrics.usedJSHeapSize} bytes`)
    console.log(`Objects added: ${added.length}, removed: ${removed.length}, changed: ${changed.length}`)

    return { added, removed, changed }
  }

  /**
   * Analyze a component's memory usage over time
   * @param snapshots Array of heap snapshots
   * @param componentName Name of the component to analyze
   * @returns Array of memory usage data points
   */
  public analyzeComponentMemoryOverTime(
    snapshots: HeapSnapshot[],
    componentName: string
  ): Array<{ timestamp: number; memoryUsage: number }> {
    // Sort snapshots by timestamp
    const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)

    // Extract memory usage for the component from each snapshot
    const memoryUsageOverTime: Array<{ timestamp: number; memoryUsage: number }> = []

    for (const snapshot of sortedSnapshots) {
      const componentUsage = this.findComponentMemoryUsage(snapshot)
      const memoryUsage = componentUsage.get(componentName) || 0

      memoryUsageOverTime.push({
        timestamp: snapshot.timestamp,
        memoryUsage,
      })
    }

    return memoryUsageOverTime
  }

  /**
   * Find objects causing memory pressure
   * @param snapshot Heap snapshot to analyze
   * @param threshold Size threshold in bytes (default: 1MB)
   * @returns Array of nodes causing memory pressure
   */
  public findMemoryPressureObjects(snapshot: HeapSnapshot, threshold: number = 1000000): HeapNode[] {
    // Sort nodes by retained size
    const sortedNodes = [...snapshot.nodes].sort((a, b) => b.retainedSize - a.retainedSize)

    // Return nodes above threshold
    return sortedNodes.filter((node) => node.retainedSize > threshold)
  }

  /**
   * Generate a memory usage summary by object type
   * @param snapshot Heap snapshot to analyze
   * @returns Map of object types to total memory usage
   */
  public generateMemoryUsageSummary(snapshot: HeapSnapshot): Map<string, number> {
    const typeUsage = new Map<string, number>()

    // Group by constructor name
    for (const node of snapshot.nodes) {
      const type = node.name
      const currentUsage = typeUsage.get(type) || 0
      typeUsage.set(type, currentUsage + node.selfSize)
    }

    return typeUsage
  }

  private isHeapProfilerAvailable(): boolean {
    // Check if Chrome DevTools Protocol is available
    // This works in Chrome when DevTools is open or when running in headless mode with CDP enabled
    return (
      typeof window !== 'undefined' &&
      // @ts-ignore - Chrome DevTools Protocol
      (typeof window.Profiler !== 'undefined' ||
        // @ts-ignore
        typeof window.HeapProfiler !== 'undefined' ||
        // Check if we're in a Node.js environment with v8 profiler
        (typeof global !== 'undefined' &&
          // @ts-ignore
          typeof global.v8 !== 'undefined' &&
          // @ts-ignore
          typeof global.v8.startSamplingHeapProfiler === 'function'))
    )
  }

  private async captureHeapSnapshot(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Try to use Chrome DevTools Protocol if available
        // @ts-ignore - Chrome DevTools Protocol
        if (typeof window !== 'undefined' && window.HeapProfiler && window.HeapProfiler.takeHeapSnapshot) {
          const chunks: any[] = []

          // @ts-ignore - Chrome DevTools Protocol
          window.HeapProfiler.takeHeapSnapshot(
            {
              reportProgress: false,
            },
            (chunk: any) => {
              chunks.push(chunk)
            },
            () => {
              resolve(chunks)
            },
            (error: Error) => {
              reject(error)
            }
          )
          return
        }

        // Try to use Node.js v8 profiler if available
        // @ts-ignore
        if (typeof global !== 'undefined' && global.v8 && global.v8.getHeapSnapshot) {
          try {
            // @ts-ignore
            const snapshot = global.v8.getHeapSnapshot()
            resolve(snapshot)
            return
          } catch (e) {
            console.warn('Failed to get heap snapshot using Node.js v8 profiler:', e)
          }
        }

        // Fallback to performance.memory for basic metrics
        // This won't provide a full heap snapshot, just basic metrics
        // @ts-ignore
        if (typeof window !== 'undefined' && window.performance?.memory) {
          resolve({
            // @ts-ignore
            totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            // @ts-ignore
            usedJSHeapSize: window.performance.memory.usedJSHeapSize,
            // @ts-ignore
            jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
            timestamp: Date.now(),
          })
        } else {
          console.warn('No heap snapshot API available')
          resolve(null)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private parseHeapSnapshot(rawData: any): HeapSnapshot {
    // If we have actual Chrome DevTools Protocol heap snapshot data
    if (Array.isArray(rawData)) {
      return this.parseChromeDPHeapSnapshot(rawData)
    }

    // If we have just the memory metrics
    if (rawData && typeof rawData.usedJSHeapSize === 'number') {
      return {
        id: generateUniqueId(),
        timestamp: Date.now(),
        nodes: [],
        rootNodeIds: [],
        objectCount: 0,
        metrics: {
          totalJSHeapSize: rawData.totalJSHeapSize || 0,
          usedJSHeapSize: rawData.usedJSHeapSize || 0,
          jsHeapSizeLimit: rawData.jsHeapSizeLimit || 0,
          timestamp: rawData.timestamp || Date.now(),
        },
      }
    }

    // Empty snapshot as fallback
    return {
      id: generateUniqueId(),
      timestamp: Date.now(),
      nodes: [],
      rootNodeIds: [],
      objectCount: 0,
      metrics: {
        totalJSHeapSize: 0,
        usedJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        timestamp: Date.now(),
      },
    }
  }

  private parseChromeDPHeapSnapshot(chunks: any[]): HeapSnapshot {
    try {
      // Combine chunks into a single string
      const combinedData = typeof chunks[0] === 'string' ? chunks.join('') : JSON.stringify(chunks)

      let parsedData

      try {
        parsedData = JSON.parse(combinedData)
      } catch (error) {
        console.error('Failed to parse heap snapshot data:', error)
        parsedData = { nodes: [], edges: [] }
      }

      // Extract nodes and edges from the parsed data
      const nodes: HeapNode[] = []
      const rootNodeIds: number[] = []
      const nodeMap = new Map<number, HeapNode>()

      // Chrome DevTools Protocol heap snapshot format is complex
      // It uses typed arrays with a specific structure defined in snapshot_meta
      const meta = parsedData.snapshot?.meta || {}
      const nodeFields = meta.node_fields || ['id', 'name', 'size', 'retained_size', 'type']
      const nodeData = parsedData.nodes || []

      // Process nodes
      const nodeFieldCount = nodeFields.length
      for (let i = 0; i < nodeData.length; i += nodeFieldCount) {
        const id = nodeData[i]
        const nameIndex = nodeData[i + nodeFields.indexOf('name')]
        const name = this.getStringFromIndex(parsedData, nameIndex)
        const selfSize = nodeData[i + nodeFields.indexOf('size')] || 0
        const retainedSize = nodeData[i + nodeFields.indexOf('retained_size')] || 0
        const typeIndex = nodeData[i + nodeFields.indexOf('type')]
        const type = this.mapNodeType(typeIndex)

        const node: HeapNode = {
          id,
          name,
          selfSize,
          retainedSize,
          type,
          edges: [],
        }

        nodes.push(node)
        nodeMap.set(id, node)

        // Check if this is a root node
        if (name.includes('(Root)') || name.includes('(GC roots)')) {
          rootNodeIds.push(id)
        }
      }

      // Process edges to build the node graph
      const edgeFields = meta.edge_fields || ['from_node', 'to_node', 'name', 'type']
      const edgeFieldCount = edgeFields.length
      const edgeData = parsedData.edges || []

      for (let i = 0; i < edgeData.length; i += edgeFieldCount) {
        const fromNodeId = edgeData[i + edgeFields.indexOf('from_node')]
        const toNodeId = edgeData[i + edgeFields.indexOf('to_node')]
        const nameIndex = edgeData[i + edgeFields.indexOf('name')]
        const name = this.getStringFromIndex(parsedData, nameIndex)
        const typeIndex = edgeData[i + edgeFields.indexOf('type')]
        const type = this.mapEdgeType(typeIndex)

        const fromNode = nodeMap.get(fromNodeId)
        if (fromNode && fromNode.edges) {
          fromNode.edges.push({
            name,
            type,
            toNode: toNodeId,
          })
        }
      }

      // Generate memory metrics
      const metrics: MemoryMetrics = {
        totalJSHeapSize: parsedData.snapshot?.total_heap_size || 0,
        usedJSHeapSize: parsedData.snapshot?.used_heap_size || 0,
        jsHeapSizeLimit: parsedData.snapshot?.max_heap_size || 0,
        timestamp: Date.now(),
      }

      return {
        id: generateUniqueId(),
        timestamp: Date.now(),
        nodes,
        rootNodeIds,
        objectCount: nodes.length,
        metrics,
      }
    } catch (error) {
      console.error('Error parsing Chrome heap snapshot:', error)

      // Return empty snapshot as fallback
      return {
        id: generateUniqueId(),
        timestamp: Date.now(),
        nodes: [],
        rootNodeIds: [],
        objectCount: 0,
        metrics: {
          totalJSHeapSize: 0,
          usedJSHeapSize: 0,
          jsHeapSizeLimit: 0,
          timestamp: Date.now(),
        },
      }
    }
  }

  private getStringFromIndex(snapshot: any, index: number): string {
    // In Chrome DevTools Protocol heap snapshots, strings are stored in a strings array
    const strings = snapshot.strings || []
    return String(strings[index] || 'Unknown')
  }

  private mapNodeType(typeId: number): HeapNodeType {
    // Map Chrome DevTools Protocol node type IDs to our HeapNodeType
    const typeMap: Record<number, HeapNodeType> = {
      0: 'object',
      1: 'native',
      2: 'code',
      3: 'closure',
      4: 'synthetic',
      5: 'concatenated string',
      6: 'sliced string',
      7: 'array',
      8: 'regexp',
    }

    return typeMap[typeId] || 'object'
  }

  private mapEdgeType(typeId: number): HeapEdge['type'] {
    // Map Chrome DevTools Protocol edge type IDs to our HeapEdge type
    const typeMap: Record<number, HeapEdge['type']> = {
      0: 'context',
      1: 'element',
      2: 'property',
      3: 'internal',
      4: 'hidden',
      5: 'shortcut',
      6: 'weak',
    }

    return typeMap[typeId] || 'property'
  }

  private extractComponentName(nodeName: string): string | null {
    // Several patterns to extract React component names
    const patterns = [
      /ReactComponent\(([^)]+)\)/, // ReactComponent(MyComponent)
      /React\.Component\[([^\]]+)\]/, // React.Component[MyComponent]
      /ReactElement\(([^)]+)\)/, // ReactElement(MyComponent)
      /React\.Element\[([^\]]+)\]/, // React.Element[MyComponent]
      /Fiber\[([^\]]+)\]/, // Fiber[MyComponent]
      /ForwardRef\(([^)]+)\)/, // ForwardRef(MyComponent)
      /Memo\(([^)]+)\)/, // Memo(MyComponent)
      /LazyComponent\[([^\]]+)\]/, // LazyComponent[MyComponent]
      /([A-Z][a-zA-Z0-9]+)(Component|Element|Container)/, // MyComponent, MyElement, MyContainer
      /class ([A-Z][a-zA-Z0-9]+)/, // class MyComponent
      /function ([A-Z][a-zA-Z0-9]+)/, // function MyComponent
    ]

    for (const pattern of patterns) {
      const match = nodeName.match(pattern)
      if (match) {
        return match[1]
      }
    }

    // If no match found but contains React, try to extract name
    if (nodeName.includes('React')) {
      // Remove common prefixes and get last part of name
      const parts = nodeName
        .replace('React.', '')
        .replace('react.', '')
        .split(/[.:<>]/)

      return parts[parts.length - 1] || null
    }

    return null
  }

  private extractComponentNameFromFiber(node: HeapNode, snapshot: HeapSnapshot): string | null {
    if (!node.edges) return null

    // Look for type or elementType edge properties which point to the component
    for (const edge of node.edges) {
      if (['type', 'elementType', 'tag', 'key', 'ctor'].includes(edge.name)) {
        // Find target node
        const targetNode = snapshot.nodes.find((n) => n.id === edge.toNode)
        if (targetNode) {
          // Try to extract component name from the target node
          const componentName = this.extractComponentName(targetNode.name)
          if (componentName) return componentName

          // If we couldn't extract a name, check if target node has childNodes
          if (targetNode.edges) {
            const displayNameEdge = targetNode.edges.find((e) => e.name === 'displayName')
            if (displayNameEdge) {
              const displayNameNode = snapshot.nodes.find((n) => n.id === displayNameEdge.toNode)
              if (displayNameNode) {
                return displayNameNode.name
              }
            }
          }
        }
      }
    }

    // Look for stateNode which might point to a component instance
    const stateNodeEdge = node.edges.find((e) => e.name === 'stateNode')
    if (stateNodeEdge) {
      const stateNode = snapshot.nodes.find((n) => n.id === stateNodeEdge.toNode)
      if (stateNode) {
        return this.extractComponentName(stateNode.name)
      }
    }

    return null
  }

  private findDetachedDomElements(snapshot: HeapSnapshot): HeapNode[] {
    const detachedNodes: HeapNode[] = []
    const domNodes = snapshot.nodes.filter(
      (node) =>
        (node.name.includes('HTML') && node.name.includes('Element')) ||
        node.name.includes('DocumentFragment') ||
        node.name.includes('Document')
    )

    // For each DOM node, check if it's connected to the document
    for (const node of domNodes) {
      if (this.isNodeDetached(node, snapshot)) {
        detachedNodes.push(node)
      }
    }

    return detachedNodes
  }

  private isNodeDetached(node: HeapNode, snapshot: HeapSnapshot): boolean {
    // Check if the node has a path to a document root
    // This is a simplified implementation

    // Get document nodes
    const documentNodes = snapshot.nodes.filter(
      (n) => n.name === 'HTMLDocument' || n.name === 'Document' || n.name.includes('Window')
    )

    if (documentNodes.length === 0) return false

    // Check if this node can be reached from any document node
    // In a real implementation, we'd do a proper graph traversal
    // Here we'll use a heuristic: check if retainedSize > 0 and no parent node
    return node.retainedSize > 0 && !this.hasParentNode(node, snapshot)
  }

  private hasParentNode(node: HeapNode, snapshot: HeapSnapshot): boolean {
    // Check if any node has an edge pointing to this node
    // In a full implementation, we'd check for specific parent-child relationships

    const nodeId = node.id

    for (const potentialParent of snapshot.nodes) {
      if (potentialParent.edges) {
        for (const edge of potentialParent.edges) {
          if (
            edge.toNode === nodeId &&
            (edge.name === 'childNodes' ||
              edge.name === 'children' ||
              edge.name === 'firstChild' ||
              edge.name === 'lastChild')
          ) {
            return true
          }
        }
      }
    }

    return false
  }

  private findLargeObjects(snapshot: HeapSnapshot, threshold: number = 1000000): HeapNode[] {
    // Find objects with large retained sizes (default: 1MB)
    return snapshot.nodes.filter((node) => node.retainedSize > threshold)
  }

  private findCircularReferences(snapshot: HeapSnapshot): HeapNode[] {
    // Finding circular references requires graph cycle detection
    // This is a simplified implementation that looks for patterns
    // that commonly indicate cycles

    const potentialCycles: HeapNode[] = []

    // Check for objects that reference themselves or have bidirectional references
    for (const node of snapshot.nodes) {
      if (node.edges) {
        // Check for self-references
        for (const edge of node.edges) {
          if (edge.toNode === node.id) {
            potentialCycles.push(node)
            break
          }
        }

        // Check for bidirectional references
        for (const edge of node.edges) {
          const targetNode = snapshot.nodes.find((n) => n.id === edge.toNode)
          if (targetNode && targetNode.edges) {
            for (const backEdge of targetNode.edges) {
              if (backEdge.toNode === node.id) {
                // Found a bidirectional reference
                potentialCycles.push(node)
                break
              }
            }
          }
        }
      }
    }

    return potentialCycles
  }

  private findUnexpectedObjectCounts(snapshot: HeapSnapshot, threshold: number = 1000): HeapNode[] {
    // Group nodes by constructor
    const objectGroups = this.groupNodesByConstructor(snapshot)

    const unexpectedObjects: HeapNode[] = []

    // Check for constructor types with unexpectedly high counts
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [constructor, nodes] of objectGroups) {
      if (nodes.length > threshold) {
        // For demonstration, just include the first few nodes of this type
        unexpectedObjects.push(...nodes.slice(0, 10))
      }
    }

    return unexpectedObjects
  }

  private groupNodesByConstructor(snapshot: HeapSnapshot): Map<string, HeapNode[]> {
    const groups = new Map<string, HeapNode[]>()

    for (const node of snapshot.nodes) {
      const constructor = node.name
      if (!groups.has(constructor)) {
        groups.set(constructor, [])
      }
      groups.get(constructor)?.push(node)
    }

    return groups
  }
}
