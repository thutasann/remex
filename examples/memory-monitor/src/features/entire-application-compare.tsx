import { useState } from 'react'
import { InefficiencyComponent, OptimizedComponent } from '../components'

/**
 * Compare Components
 * @returns Compare Components
 */
function EntireApplicationCompare() {
  const [showInefficient, setShowInefficient] = useState(false)
  const [showOptimized, setShowOptimized] = useState(false)

  return (
    <div>
      <h1>Remex Memory Monitor Example - Entire Application Compare</h1>

      <div className='controls-container'>
        <div className='toggle-buttons'>
          <button
            onClick={() => setShowInefficient(!showInefficient)}
            className={showInefficient ? 'active inefficient-btn' : ''}
          >
            {showInefficient ? 'Hide' : 'Show'} Inefficient Component
          </button>

          <button
            onClick={() => setShowOptimized(!showOptimized)}
            className={showOptimized ? 'active optimized-btn' : ''}
          >
            {showOptimized ? 'Hide' : 'Show'} Optimized Component
          </button>
        </div>
      </div>

      <div className='components-container'>
        {showInefficient && (
          <div className='component-wrapper inefficient-wrapper'>
            <InefficiencyComponent />
          </div>
        )}

        {showOptimized && (
          <div className='component-wrapper optimized-wrapper'>
            <OptimizedComponent />
          </div>
        )}
      </div>
    </div>
  )
}

export default EntireApplicationCompare
