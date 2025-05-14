import { PerformanceEvent, PerformanceEventType, RenderInfo, RenderMetrics } from '@/types'
import { generateUniqueId } from '@/utils'

/**
 * Core Performance Tracker class
 * Responsible for tracking render times and performance metrics
 */
export class PerformanceTracker {
  private renderInfo: Map<string, RenderInfo> = new Map()
  private temporaryRenderMetrics: Map<string, Map<string, Partial<RenderMetrics>>> = new Map()
  private eventListeners: Map<string, ((event: PerformanceEvent) => void)[]> = new Map()
  private maxRenderHistory: number
  private isTracking = false

  constructor(maxRenderHistory: number = 50) {
    this.maxRenderHistory = maxRenderHistory
  }

  /**
   * Start performance tracking
   */
  public startTracking(): void {
    this.isTracking = true
  }

  /**
   * Stop performance tracking
   */
  public stopTracking(): void {
    this.isTracking = false
  }

  /**
   * Track the start of a component render
   * @param componentId Component identifier
   * @param componentName Component display name
   * @param isInitialRender Whether this is the initial render
   * @returns Render ID for tracking completion
   */
  public trackRenderStart(componentId: string, componentName: string, isInitialRender = false): string {
    if (!this.isTracking) return ''

    const renderId = generateUniqueId()
    const startTime = performance.now()

    const metrics: Partial<RenderMetrics> = {
      id: renderId,
      componentName,
      startTime,
      isInitialRender,
    }

    // store the partial metrics in a temporary location
    this.storeTemporaryRenderMetrics(componentId, metrics)

    // Emit render-start event
    this.emitEvent({
      id: generateUniqueId(),
      type: 'render-start',
      componentId,
      timestamp: startTime,
      metadata: {
        renderId,
        isInitialRender,
      },
    })

    return renderId
  }

  /**
   * Track the completion of a component render
   * @param componentId Component identifier
   * @param renderId Render ID from trackRenderStart
   * @param changedProps Props that changed causing the render
   */
  public trackRenderComplete(componentId: string, renderId: string, changedProps: string[]): void {
    if (!this.isTracking || !renderId) {
      return
    }

    const endTime = performance.now()
    const tempMetrics = this.getTemporaryRenderMetrics(componentId, renderId)

    if (!tempMetrics || !tempMetrics.startTime) {
      console.warn(`No matching render-start found for component ${componentId} with render ID ${renderId}`)
      return
    }

    const duration = endTime - (tempMetrics.startTime - endTime)

    // Complete the render metrics
    const metrics: RenderMetrics = {
      id: renderId,
      componentName: tempMetrics.componentName || 'Unknown',
      startTime: tempMetrics.startTime || 0,
      endTime,
      duration,
      isInitialRender: tempMetrics.isInitialRender || false,
      changedProps,
      isAvoidable: changedProps?.length === 0 && !tempMetrics.isInitialRender,
    }

    // Update component render info
    this.updateComponentRenderInfo(componentId, metrics)

    // Clean up temporary metrics
    this.clearTemporaryRenderMetrics(componentId, renderId)

    // Emit render-complete event
    this.emitEvent({
      id: generateUniqueId(),
      type: 'render-complete',
      componentId,
      timestamp: endTime,
      duration,
      metadata: {
        renderId,
        isInitialRender: metrics.isInitialRender,
        isAvoidable: metrics.isAvoidable,
      },
    })
  }

  /**
   * Get render information for a specific component
   * @param componentId Component identifier
   */
  public getComponentRenderInfo(componentId: string): RenderInfo | null {
    return this.renderInfo.get(componentId) || null
  }

  /**
   * Get render information for all tracked components
   */
  public getAllComponentRenderInfo(): RenderInfo[] {
    return Array.from(this.renderInfo.values())
  }

  /**
   * Clear render history for a specific component
   * @param componentId Component identifier
   */
  public clearComponentRenderHistory(componentId: string): void {
    this.renderInfo.delete(componentId)
  }

  /**
   * Clear render history for all components
   */
  public clearAllRenderHistory(): void {
    this.renderInfo.clear()
  }

  /**
   * Add event listener
   * @param eventType Event type to listen for
   * @param listener Callback function
   */
  public addEventListener(eventType: PerformanceEventType, listener: (event: PerformanceEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)?.push(listener)
  }

  /**
   * Remove event listener
   * @param eventType Event type
   * @param listener Callback function to remove
   */
  public removeEventListener(eventType: PerformanceEventType, listener: (event: PerformanceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)

    if (!listeners) {
      return
    }

    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  private storeTemporaryRenderMetrics(componentId: string, metrics: Partial<RenderMetrics>): void {
    if (!this.temporaryRenderMetrics.has(componentId)) {
      this.temporaryRenderMetrics.set(componentId, new Map())
    }
    this.temporaryRenderMetrics.get(componentId)?.set(metrics.id || '', metrics)
  }

  private getTemporaryRenderMetrics(componentId: string, renderId: string): Partial<RenderMetrics> | undefined {
    return this.temporaryRenderMetrics.get(componentId)?.get(renderId)
  }

  private clearTemporaryRenderMetrics(componentId: string, renderId: string): void {
    this.temporaryRenderMetrics.get(componentId)?.delete(renderId)
  }

  private updateComponentRenderInfo(componentId: string, metrics: RenderMetrics): void {
    let info = this.renderInfo.get(componentId)

    if (!info) {
      info = {
        componentId,
        displayName: metrics.componentName,
        renderCount: 0,
        averageRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: Infinity,
        firstRenderTime: metrics.startTime,
        lastRenderTime: metrics.endTime,
        renderHistory: [],
        wastedRenders: 0,
      }

      this.renderInfo.set(componentId, info)
    }

    // Update render count
    info.renderCount += 1

    // Update timestamps
    info.lastRenderTime = metrics.endTime

    // Update render time stats
    info.maxRenderTime = Math.max(info.maxRenderTime, metrics.duration)
    info.minRenderTime = Math.min(info.minRenderTime, metrics.duration)

    // Update average render time
    const totalTime = info.averageRenderTime * (info.renderCount - 1) + metrics.duration
    info.averageRenderTime = totalTime / info.renderCount

    // Track wasted renders
    if (metrics.isAvoidable) {
      info.wastedRenders += 1
    }

    // Add to render history, respecting max history size
    info.renderHistory.push(metrics)
    if (info.renderHistory.length > this.maxRenderHistory) {
      info.renderHistory = info.renderHistory.slice(-this.maxRenderHistory)
    }
  }

  private emitEvent(event: PerformanceEvent): void {
    const listeners = this.eventListeners.get(event.type) || []

    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in performance event listener:', error)
      }
    }
  }
}
