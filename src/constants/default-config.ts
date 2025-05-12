import { RemexOptions } from '@/types'

/**
 * Default configuration values
 * @description This is the default configuration for Remex.
 * @author [thutasann](https://github.com/thutasann)
 * @version 0.0.1
 */
const DEFAULT_CONFIG: RemexOptions = {
  enabled: true,
  trackMemory: true,
  trackRenders: true,
  trackHeapSnapshots: false,
  memorySamplingRate: 2000,
  maxMemorySnapshots: 100,
  maxRenderHistory: 50,
  detectAvoidableRenders: true,
  connectToDevTools: true,
}

export default DEFAULT_CONFIG
