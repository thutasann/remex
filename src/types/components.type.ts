import type { ReactNode } from 'react'
import type { RemexOptions } from './config.type'

/**
 * Props for the RemexProvider component
 */
export type RemexProviderProps = {
  children: ReactNode

  /** Configuration options */
  options?: Partial<RemexOptions>
}

/**
 * Props for the MemoryProfiler component
 */
export type MemoryProfilerProps = {
  /** React children */
  children: ReactNode

  /** Component identifier */
  id?: string

  /** Whether to track this component's memory usage */
  enabled?: boolean

  /** Callback when memory snapshot is taken */
  onSnapshot?: (componentId: string, shallowSize: number, retainedSize: number) => void
}

/**
 * Props for the RenderProfiler component
 */
export type RenderProfilerProps = {
  /** React children */
  children: ReactNode

  /** Component identifier */
  id: string

  /** Whether to track this component's renders */
  enabled?: boolean

  /** Callback when render occurs */
  onRender?: (id: string, phase: 'mount' | 'update', actualDuration: number) => void
}
