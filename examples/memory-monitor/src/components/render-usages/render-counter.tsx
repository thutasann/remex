import { RenderProfiler, useRenderCounter } from 'remexjs'

interface RenderCounterProps {
  count: number
}

const RenderCounterChild = ({ count }: RenderCounterProps) => {
  const renderCount = useRenderCounter({
    componentName: 'RenderCounterChild',
    logToConsole: true,
  })

  return (
    <div className='render-counter-child'>
      <h4>Child Component (renders: {renderCount})</h4>
      <p>Parent count: {count}</p>
    </div>
  )
}

const RenderCounter = ({ count }: RenderCounterProps) => {
  const renderCount = useRenderCounter({
    componentName: 'RenderCounter',
  })

  return (
    <RenderProfiler id='render-counter'>
      <div className='render-counter'>
        <h3>Render Counter (renders: {renderCount})</h3>
        <p>Current count: {count}</p>
        <RenderCounterChild count={count} />
      </div>
    </RenderProfiler>
  )
}

export default RenderCounter
