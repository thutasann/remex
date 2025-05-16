import { useEffect, useState } from 'react'
import { RemexProvider } from 'remexjs'
import './App.css'
import LeakyComponent from './components/LeakyComponent'
import MemoryDashboard from './components/MemoryDashboard'
import RenderCounter from './components/RenderCounter'

function App() {
  const [showLeakyComponent, setShowLeakyComponent] = useState(false)
  const [count, setCount] = useState(0)

  // Update count periodically to trigger renders
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <RemexProvider>
      <div className='app-container'>
        <h1>Remex Memory Monitor Example</h1>

        <div className='dashboard-container'>
          <MemoryDashboard />
        </div>

        <div className='controls'>
          <button onClick={() => setShowLeakyComponent(!showLeakyComponent)}>
            {showLeakyComponent ? 'Unmount Leaky Component' : 'Mount Leaky Component'}
          </button>
          <p>Count: {count}</p>
        </div>

        {showLeakyComponent && <LeakyComponent />}

        <div className='render-container'>
          <h2>Render Tracking</h2>
          <RenderCounter count={count} />
        </div>
      </div>
    </RemexProvider>
  )
}

export default App
