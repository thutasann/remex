/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentMemoryUsage, ComponentRegistry, PerformanceExtended } from '../../types'

/**
 * Memory Tracker for Each Components
 * @description This class is used to track the memory usage of each component.
 */
class ComponentMemoryTracker {
  private componentRegistry = new Map<string, ComponentRegistry>()
  private objectSizeCache = new Map<object, number>()
  private lastGlobalUsage = 0

  /**
   * Register a component for memory tracking
   */
  public registerComponent(componentId: string, displayName: string, component: React.ReactNode): void {
    const beforeSize = this.getCurrentMemoryUsage()

    const existing = this.componentRegistry.get(componentId)

    if (existing) {
      this.componentRegistry.set(componentId, {
        ...existing,
        instances: existing.instances + 1,
      })
    } else {
      this.componentRegistry.set(componentId, {
        displayName,
        instances: 1,
        estimatedSize: 0,
        objectIds: new Set(),
      })
    }

    setTimeout(() => {
      const afterSize = this.getCurrentMemoryUsage()
      const estimatedSize = Math.max(0, afterSize - beforeSize)

      const compInfo = this.componentRegistry.get(componentId)
      if (compInfo) {
        this.componentRegistry.set(componentId, {
          ...compInfo,
          estimatedSize: estimatedSize / compInfo.instances,
        })
      }

      this.trackComponentObjects(componentId, component)
    }, 0)
  }

  /**
   * Unregister a component
   */
  public unregisterComponent(componentId: string): void {
    const existing = this.componentRegistry.get(componentId)

    if (existing && existing.instances > 1) {
      this.componentRegistry.set(componentId, {
        ...existing,
        instances: existing.instances - 1,
      })
    } else {
      this.componentRegistry.delete(componentId)
    }
  }

  /**
   * Get memory usage for a specific component
   */
  public getComponentMemoryUsage(componentId: string): ComponentMemoryUsage | null {
    const component = this.componentRegistry.get(componentId)

    if (!component) {
      console.warn(`[Remex] Componenet not found to get memeory usage`)
      return null
    }

    const shallowSize = component.estimatedSize

    // For retained size, we need to estimate object graph size
    // This is a simplified estimation
    const retainedSize = shallowSize * 1.5 // Rough estimate

    return {
      componentId,
      displayName: component.displayName,
      shallowSize,
      retainedSize,
      instanceCount: component.instances,
    }
  }

  /**
   * Get current memory usage in bytes
   */
  private getCurrentMemoryUsage(): number {
    const performance = window.performance as unknown as PerformanceExtended
    if (performance && performance.memory) {
      this.lastGlobalUsage = performance.memory.usedJSHeapSize
      return performance.memory.usedJSHeapSize
    }
    return this.lastGlobalUsage
  }

  /**
   * Try to track objects created by this component
   * - Implementation would use WeakMap/WeakSet to track objects
   * - without preventing garbage collection
   * - This is a complex topic that would require deeper browser integration
   * TODO: implement this
   */
  private trackComponentObjects(componentId: string, component: React.ReactNode): void {}

  /**
   * Estimate object size recursively
   * This is a simplified implementation and has limitations
   * TODO: implement this
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private estimateObjectSize(obj: any, seen = new WeakSet()): number {
    if (this.objectSizeCache.has(obj)) {
      return this.objectSizeCache.get(obj) || 0
    }

    if (obj === null || obj === undefined) return 0
    if (typeof obj !== 'object' && typeof obj !== 'function') {
      return 8
    }

    // Prevent circular references
    if (seen.has(obj)) return 0
    seen.add(obj)

    let size = 0

    // Arrays
    if (Array.isArray(obj)) {
      size = 32 // Base array overhead
      for (const item of obj) {
        size += this.estimateObjectSize(item, seen)
      }
    }
    // Objects
    else {
      size = 40 // Base object overhead
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          size += key.length * 2 // Key size (2 bytes per character)
          size += this.estimateObjectSize(obj[key], seen)
        }
      }
    }

    this.objectSizeCache.set(obj, size)
    return size
  }
}

/**
 * Component Memory Tracker Instance
 */
export const componentMemoryTracker = new ComponentMemoryTracker()
