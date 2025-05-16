import { useEffect, useState } from 'react'
import { useMemoryMonitor } from 'remexjs'

const MemoryDashboard = () => {
  const { metrics, history, isMonitoring, startMonitoring, stopMonitoring } = useMemoryMonitor()
  const [memoryHistory, setMemoryHistory] = useState<Array<{ time: string; used: number }>>([])

  useEffect(() => {
    if (history && history.length > 0) {
      setMemoryHistory(
        history.map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          used: Math.round(item.usedJSHeapSize / (1024 * 1024)), // MB
        }))
      )
    }
  }, [history])

  if (!metrics) return <div>Loading metrics...</div>

  return (
    <div className='memory-dashboard'>
      <h2>Memory Usage</h2>
      <button onClick={isMonitoring ? stopMonitoring : startMonitoring}>
        {isMonitoring ? 'Pause Monitoring' : 'Start Monitoring'}
      </button>

      <div className='memory-stats'>
        <div className='stat-item'>
          <h3>Used Heap</h3>
          <p>{(metrics.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
        <div className='stat-item'>
          <h3>Total Heap</h3>
          <p>{(metrics.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
        <div className='stat-item'>
          <h3>Heap Limit</h3>
          <p>{(metrics.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      </div>

      <div className='memory-history'>
        <h3>Memory History</h3>
        <div className='history-chart'>
          {memoryHistory.map((item, index) => (
            <div
              key={index}
              className='history-bar'
              style={{
                height: `${item.used}px`,
                maxHeight: '100px',
              }}
              title={`${item.time}: ${item.used} MB`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MemoryDashboard
