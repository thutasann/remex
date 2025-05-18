import { useState } from 'react'
import { ComponentMemoryUsagesInefficiencyComponent, ComponentMemoryUsagesOptimizedComponent } from '../components'

/**
 * Compare Components
 * @returns Compare Components
 */
function CompareComponents() {
  const [showInefficient, setShowInefficient] = useState(false)
  const [showOptimized, setShowOptimized] = useState(false)

  return (
    <div>
      <h1>Remex Memory Monitor Example</h1>

      <div className='controls-container'>
        <h2>Component Comparison</h2>
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
            <ComponentMemoryUsagesInefficiencyComponent />
          </div>
        )}

        {showOptimized && (
          <div className='component-wrapper optimized-wrapper'>
            <ComponentMemoryUsagesOptimizedComponent />
          </div>
        )}
      </div>
    </div>
  )
}

export default CompareComponents
