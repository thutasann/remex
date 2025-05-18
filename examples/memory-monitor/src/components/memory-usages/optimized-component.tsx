import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMemoryMonitor } from 'remexjs'

const OptimizedComponent = () => {
  const [renderCount, setRenderCount] = useState(0)
  const { metrics, history } = useMemoryMonitor({
    interval: 1000,
    maxSamples: 10,
  })

  // Optimized: Using useMemo to avoid recreating data on each render
  const data = useMemo(() => {
    // Create the data only once
    const result = []
    for (let i = 0; i < 100; i++) {
      // Use smaller arrays with reduced size
      result.push(new Array(100).fill(`Item ${i}`))
    }
    return result
  }, [])

  // Optimized: Using useEffect with proper dependencies
  useEffect(() => {
    // Only re-render when necessary
    const interval = setInterval(() => {
      setRenderCount((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Optimized: Using useCallback to avoid creating new function on every render
  const handleClick = useCallback(() => {
    console.log('Clicked button', new Date())
    // No unnecessary object creation here
  }, [])

  // Optimized: Memoize the buttons so they don't re-render unnecessarily
  const buttons = useMemo(() => {
    return Array(100)
      .fill(null)
      .map((_, i) => (
        <button key={i} onClick={handleClick}>
          Button {i} (shared callback)
        </button>
      ))
  }, [handleClick])

  return (
    <div className='component optimized'>
      <h3>Optimized Component</h3>
      <p>This component uses memory efficiently and minimizes re-renders.</p>
      <p>Render count: {renderCount}</p>
      <p>Arrays in memory: {data.length}</p>
      <p>Approximate memory used: ~{(data.length * 0.001).toFixed(3)} MB</p>

      {metrics && (
        <div className='component-memory'>
          <h4>Component Memory Metrics</h4>
          <div className='memory-stats'>
            <div className='stat-item'>
              <h5>Used Heap</h5>
              <p>{(metrics.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <div className='stat-item'>
              <h5>Total Heap</h5>
              <p>{(metrics.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <div className='stat-item'>
              <h5>Memory Trend</h5>
              <div className='mini-chart'>
                {history &&
                  history.slice(-5).map((item, idx) => (
                    <div
                      key={idx}
                      className='mini-bar optimized-bar'
                      style={{
                        height: `${item.usedJSHeapSize / (1024 * 1024) / 2}px`,
                        maxHeight: '50px',
                      }}
                      title={`${(item.usedJSHeapSize / (1024 * 1024)).toFixed(1)} MB`}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='button-container'>
        {/* Optimized: Using memoized button array */}
        {buttons}
      </div>
    </div>
  )
}

export default OptimizedComponent
