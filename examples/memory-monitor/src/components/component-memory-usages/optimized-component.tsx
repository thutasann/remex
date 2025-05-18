import { useEffect, useMemo, useState } from 'react'
import { MemoryProfiler, useComponentMemory } from 'remexjs'

/**
 * Optimized Component Memory Usages
 * @returns Optimized Component Memory Usages
 */
export function ComponentMemoryUsagesOptimizedComponent() {
  const [data, setData] = useState<number[]>([])
  const memoryMetrics = useComponentMemory()

  // Use memoization to prevent unnecessary recalculations
  const displayData = useMemo(() => {
    return data.slice(0, 5)
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => {
      // Create new array but with a reasonable size
      const newData = Array.from({ length: 100 }, (_, i) => i)
      setData(newData)
    }, 1000)

    return () => {
      clearInterval(interval)
      // Clean up state when component unmounts
      setData([])
    }
  }, [])

  return (
    <MemoryProfiler id='optimized-component'>
      <div className='component optimized'>
        <h3>Optimized Component</h3>
        <div className='memory-info'>
          <p>Memory Usage: {(memoryMetrics.shallowSize / 1024).toFixed(2)} KB</p>
          <p>Data Length: {data.length}</p>
        </div>
        <div className='data-display'>
          {displayData.map((num) => (
            <div key={num} className='data-item'>
              {num}
            </div>
          ))}
        </div>
      </div>
    </MemoryProfiler>
  )
}
