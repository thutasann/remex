import { useEffect, useState } from 'react'
import { useMemoryMonitor } from 'remexjs'

const InefficiencyComponent = () => {
  const [data, setData] = useState<any[]>([])
  const [renderCount, setRenderCount] = useState(0)
  const { metrics, history } = useMemoryMonitor({
    interval: 1000,
    maxSamples: 10,
  })

  // Inefficient: Creating new large arrays on each render
  useEffect(() => {
    // Create 100 large arrays unnecessarily
    const newData = []
    for (let i = 0; i < 100; i++) {
      // Each array is ~500KB (50,000 items)
      newData.push(new Array(50000).fill(`Item ${i}`))
    }
    setData(newData)

    // Force re-render frequently
    const interval = setInterval(() => {
      setRenderCount((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [renderCount])

  // Inefficient: Creating new functions on every render
  const handleClick = () => {
    console.log('Clicked button', new Date())
    // Create another large object unnecessarily
    const largeObj = new Array(100000).fill('More memory waste')
    console.log(largeObj.length)
  }

  return (
    <div className='component inefficient'>
      <h3>Inefficient Component</h3>
      <p>This component wastes memory and causes frequent re-renders.</p>
      <p>Render count: {renderCount}</p>
      <p>Arrays in memory: {data.length}</p>
      <p>Approximate memory used: ~{(data.length * 0.5).toFixed(1)} MB</p>

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
                      className='mini-bar inefficient-bar'
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
        {/* Inefficient: Creating 100 new elements on each render */}
        {Array(100)
          .fill(null)
          .map((_, i) => (
            <button key={i} onClick={handleClick}>
              Button {i} (each with its own callback)
            </button>
          ))}
      </div>
    </div>
  )
}

export default InefficiencyComponent
