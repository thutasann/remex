import DEFAULT_CONFIG from '../../configs/default-config'
import type { RemexOptions } from '../../types'
import { MemoryTracker } from './memory-tracker'
import { PerformanceTracker } from './performance-tracker'

let memoryTracker: MemoryTracker | null = null
let performanceTracker: PerformanceTracker | null = null
let isInitialized = false
let currentConfig: RemexOptions = { ...DEFAULT_CONFIG }

/**
 * Initialize Remex with configuration options
 * @param options Configuration options
 * @author [thutasann](https://github.com/thutasann)
 * @version 0.0.1
 */
function initRemex(options?: Partial<RemexOptions>): void {
  if (isInitialized) {
    console.warn('Remex is already initialized. Call resetRemex() first if you want to reinitialize.')
    return
  }

  currentConfig = {
    ...DEFAULT_CONFIG,
    ...options,
  }

  if (!currentConfig.enabled) return

  if (currentConfig.trackMemory) {
    memoryTracker = new MemoryTracker(currentConfig.maxMemorySnapshots, currentConfig.memorySamplingRate)
    memoryTracker.startTracking()
  }

  if (currentConfig.trackRenders) {
    performanceTracker = new PerformanceTracker(currentConfig.maxRenderHistory)
    performanceTracker.startTracking()
  }

  isInitialized = true

  if (currentConfig.logger) {
    currentConfig.logger.info('Remex initialized', currentConfig)
  } else {
    console.info('Remex initialized', currentConfig)
  }
}

/**
 * Reset Remex state and stop all tracking
 */
function resetRemex(): void {
  if (!isInitialized) {
    return
  }

  if (memoryTracker) {
    memoryTracker.stopTracking()
    memoryTracker = null
  }

  if (performanceTracker) {
    performanceTracker.stopTracking()
    performanceTracker = null
  }

  isInitialized = false

  // Log reset
  if (currentConfig.logger) {
    currentConfig.logger.info('Remex reset')
  } else {
    console.info('Remex reset')
  }
}

/**
 * Get the memory tracker instance
 */
function getMemoryTracker(): MemoryTracker | null {
  return memoryTracker
}

/**
 * Get the performance tracker instance
 */
function getPerformanceTracker(): PerformanceTracker | null {
  return performanceTracker
}

/**
 * Get current configuration
 */
function getConfig(): RemexOptions {
  return { ...currentConfig }
}

/**
 * Update configuration
 * @param options New configuration options
 */
function updateConfig(options: Partial<RemexOptions>): void {
  const prevConfig = { ...currentConfig }

  currentConfig = {
    ...currentConfig,
    ...options,
  }

  // Handle changes that require reinitialization
  if (isInitialized) {
    // Handle memory tracking changes
    if (
      prevConfig.trackMemory !== currentConfig.trackMemory ||
      prevConfig.memorySamplingRate !== currentConfig.memorySamplingRate ||
      prevConfig.maxMemorySnapshots !== currentConfig.maxMemorySnapshots
    ) {
      if (memoryTracker) {
        memoryTracker.stopTracking()
        memoryTracker = null
      }

      if (currentConfig.trackMemory) {
        memoryTracker = new MemoryTracker(currentConfig.maxMemorySnapshots, currentConfig.memorySamplingRate)
        memoryTracker.startTracking()
      }
    }

    // Handle render tracking changes
    if (
      prevConfig.trackRenders !== currentConfig.trackRenders ||
      prevConfig.maxRenderHistory !== currentConfig.maxRenderHistory
    ) {
      if (performanceTracker) {
        performanceTracker.stopTracking()
        performanceTracker = null
      }

      if (currentConfig.trackRenders) {
        performanceTracker = new PerformanceTracker(currentConfig.maxRenderHistory)
        performanceTracker.startTracking()
      }
    }
  }

  // Log config update
  if (currentConfig.logger) {
    currentConfig.logger.info('Remex configuration updated', currentConfig)
  } else {
    console.info('Remex configuration updated', currentConfig)
  }
}

export { initRemex, resetRemex, getMemoryTracker, getPerformanceTracker, getConfig, updateConfig }
