import { ComponentMemoryUsage, MemoryMetrics, MemorySnapshot } from '@/types'
import { generateUniqueId } from '@/utils'

export class MemoryTracker {
  private snapshots: MemorySnapshot[] = []
  private intervalId: number | null = null
  private maxSnapshots: number
  private samplingRate: number
  private isTracking = false
  private componentRegistry: Map<
    string,
    { /** component display name */ displayName: string; /** component instances count */ instances: number }
  > = new Map()

  constructor(maxSnapshots = 100, samplingRate = 2000) {
    this.maxSnapshots = maxSnapshots
    this.samplingRate = samplingRate
  }

  /**
   * Start tracking memory usage
   */
  public startTracking(): void {
    if (this.isTracking) {
      return
    }

    this.isTracking = true

    this.takeSnapshot()

    this.intervalId = window.setInterval(() => {
      this.takeSnapshot()
    }, this.samplingRate)
  }

  /**
   * Stop tracking memory usage
   */
  public stopTracking(): void {
    if (!this.isTracking || this.intervalId == null) {
      return
    }

    window.clearInterval(this.intervalId)
    this.intervalId = null
    this.isTracking = false
  }

  /**
   * Take a memory snapshot
   * @param labels Optional labels to attach to the snapshot
   * @returns The captured memory snapshot
   */
  public takeSnapshot(labels?: Record<string, string>): MemorySnapshot | null {
    try {
      const metrics = this.captureMemoryMetrics()
      if (!metrics) {
        return null
      }

      const componentBreakdown = this.getComponentBreakdown()

      const snapshot: MemorySnapshot = {
        id: generateUniqueId(),
        metrics,
        componentBreakdown,
        labels,
        metadata: {},
      }

      this.addSnapshot(snapshot)
      return snapshot
    } catch (error) {
      console.error('Failed to take memory snapshot:', error)
      return null
    }
  }

  /**
   * Get all captured snapshots
   */
  public getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots]
  }

  /**
   * CLear all snapshots
   */
  public clearAllSnapshots(): void {
    this.snapshots = []
  }

  /**
   * Register a component for memory tracking
   * @param componentId Component identifier
   * @param displayName Component display name
   */
  public registerComponent(componentId: string, displayName: string): void {
    const existing = this.componentRegistry.get(componentId)

    if (existing) {
      this.componentRegistry.set(componentId, {
        displayName,
        instances: existing.instances + 1,
      })
    } else {
      this.componentRegistry.set(componentId, {
        displayName,
        instances: 1,
      })
    }
  }

  /**
   * Unregister a component from memory tracking
   * @param componentId Component identifier
   */
  public unregisterComponent(componentId: string): void {
    const existing = this.componentRegistry.get(componentId)
    if (existing && existing.instances > 1) {
      this.componentRegistry.set(componentId, {
        displayName: existing.displayName,
        instances: existing.instances - 1,
      })
    } else {
      this.componentRegistry.delete(componentId)
    }
  }

  /**
   * Get memory metrics for a specific component
   * @param componentId Component identifier
   * @returns Estimated memory usage for the component
   */
  public getComponentMemoryUsage(componentId: string): ComponentMemoryUsage | null {
    const component = this.componentRegistry.get(componentId)

    if (!component) {
      return null
    }

    return {
      componentId,
      displayName: component.displayName,
      shallowSize: 0,
      retainedSize: 0,
      instanceCount: component.instances,
    }
  }

  /**
   * Add a snapshot to the collection, respecting the maximum limit
   */
  private addSnapshot(snapshot: MemorySnapshot): void {
    this.snapshots.push(snapshot)
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots)
    }
  }

  /**
   * Capture current memory metrics from the browser
   */
  private captureMemoryMetrics(): MemoryMetrics | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const performance = window.performance as any

    if (!performance || !performance.memory) {
      console.warn('Performance.memory API is not available in the browser')
      return null
    }

    return {
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    }
  }

  /**
   * Get memory breakdown by component
   */
  private getComponentBreakdown(): ComponentMemoryUsage[] {
    const breakdown: ComponentMemoryUsage[] = []

    for (const [componentId, component] of this.componentRegistry.entries()) {
      // In a real implementation, we would use more sophisticated methods
      // This is just a placeholder
      breakdown.push({
        componentId,
        displayName: component.displayName,
        shallowSize: 0, // Placeholder
        retainedSize: 0, // Placeholder
        instanceCount: component.instances,
      })
    }

    return breakdown
  }
}
