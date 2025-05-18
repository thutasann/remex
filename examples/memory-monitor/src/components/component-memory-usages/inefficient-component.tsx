import { useEffect, useState } from 'react'
import { MemoryProfiler, useComponentMemory } from 'remexjs'

/**
 * Inefficient Component Memory Usages
 * @returns Inefficient Component Memory Usages
 */
export function ComponentMemoryUsagesInefficiencyComponent() {
  const [data, setData] = useState<number[]>([])
  const [unusedState, setUnusedState] = useState<string[]>([])
  const memoryMetrics = useComponentMemory()

  // Create memory leaks by storing data in unused state
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = Array.from({ length: 1000 }, (_, i) => i)
      setData(newData)

      // Store unused data that will never be cleaned up
      setUnusedState((prev) => [...prev, ...newData.map(String)])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <MemoryProfiler id='inefficient-component'>
      <div className='component inefficient'>
        <h3>Inefficient Component</h3>
        <div className='memory-info'>
          <p>Memory Usage: {(memoryMetrics.shallowSize / 1024).toFixed(2)} KB</p>
          <p>Data Length: {data.length}</p>
          <p>Unused State Length: {unusedState.length}</p>
        </div>
        <div className='data-display'>
          {data.slice(0, 5).map((num) => (
            <div key={num} className='data-item'>
              {num}
            </div>
          ))}
        </div>
      </div>
    </MemoryProfiler>
  )
}
