import { RenderMetrics } from '@/types'

export class PerformanceTracker {
  private temporaryRenderMetrics: Map<string, Map<string, Partial<RenderMetrics>>> = new Map()

  private storeTemporaryRenderMetrics(componentId: string, metrics: Partial<RenderMetrics>): void {
    if (!this.temporaryRenderMetrics.has(componentId)) {
      this.temporaryRenderMetrics.set(componentId, new Map())
    }
    this.temporaryRenderMetrics.get(componentId)?.set(metrics.id || '', metrics)
  }

  private getTemporaryRenderMetrics(componentId: string, renderId: string): Partial<RenderMetrics> | undefined {
    return this.temporaryRenderMetrics.get(componentId)?.get(renderId)
  }
}
